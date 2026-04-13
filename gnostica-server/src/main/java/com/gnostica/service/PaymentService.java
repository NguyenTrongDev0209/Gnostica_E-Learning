package com.gnostica.service;

import com.gnostica.model.Account;
import com.gnostica.model.Course;
import com.gnostica.model.Order;
import com.gnostica.model.OrderDetail;
import com.gnostica.model.Wallet;
import com.gnostica.repository.OrderDetailRepository;
import com.gnostica.repository.OrderRepository;
import com.gnostica.repository.WalletRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.model.Enrollment;
import com.gnostica.model.Transaction;
import com.gnostica.repository.EnrollmentRepository;
import com.gnostica.repository.TransactionRepository;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

import vn.payos.PayOS;
import vn.payos.model.webhooks.WebhookData;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PayOS payOS;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ObjectMapper objectMapper;

    public WebhookData verifyWebhook(Object body) throws JsonProcessingException, IllegalArgumentException {
        return payOS.webhooks().verify(body);
    }

    @Transactional
    public void handlePaymentWebhook(WebhookData data) {
        Long orderId = data.getOrderCode();
        Order order = orderRepository.findById(orderId.intValue()).orElse(null);

        if (order != null && order.getStatus() == 0) {
            processSuccessfulOrder(orderId, order);
            saveTransaction(data, order);
            System.out.println("Order " + orderId + " processed successfully via service.");
        }
    }

    @Transactional
    public void processSuccessfulOrder(Long orderId, Order order) {
        if (order == null || order.getStatus() == 1) {
            return;
        }

        order.setStatus(1);
        orderRepository.save(order);

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail detail : details) {
            // 1. Create Enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setAccount(order.getAccount());
            enrollment.setCourse(detail.getCourse());
            enrollment.setProgressPercent(0);
            enrollment.setStatus(1); // 1: Active/Ongoing
            enrollmentRepository.save(enrollment);

            // 2. Credit Instructor Wallet
            Account instructor = detail.getCourse().getAccount();
            if (instructor != null) {
                Wallet wallet = walletRepository.findByAccount(instructor).orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setAccount(instructor);
                    newWallet.setRemain(0.0);
                    newWallet.setStatus(1);
                    return newWallet;
                });

                double currentRemain = wallet.getRemain() != null ? wallet.getRemain() : 0.0;
                // Assuming price in detail is the amount to credit
                wallet.setRemain(currentRemain + detail.getPrice());
                walletRepository.save(wallet);
                System.out.println("Added " + detail.getPrice() + " to instructor: " + instructor.getEmail() + " for course: " + detail.getCourse().getTitle());
            }
        }
    }

    @Transactional
    public void saveTransaction(WebhookData data, Order order) {
        Transaction transaction = new Transaction();
        transaction.setTransactionCode(data.getPaymentLinkId());
        transaction.setAmount((double) data.getAmount());
        transaction.setStatus(1);
        transaction.setPaymentMethod("PAYOS");
        transaction.setRef("PayOS Order: " + data.getOrderCode());
        transaction.setType(1);
        transaction.setSenderBankId(data.getCounterAccountBankId());
        transaction.setSenderAccountNumber(data.getCounterAccountNumber());
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setOrder(order);

        try {
            transaction.setLog(objectMapper.writeValueAsString(Map.of(
                    "webhook_full_data", data,
                    "payer_name", data.getCounterAccountName() != null ? data.getCounterAccountName() : "N/A",
                    "description", data.getDescription(),
                    "transaction_date", data.getTransactionDateTime())));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        transactionRepository.save(transaction);
    }
}
