package com.gnostica.service;

import com.gnostica.model.Account;
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
import java.util.HashMap;
import java.util.Optional;
import java.time.LocalDateTime;

import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.PaymentLink;
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
        String transactionId = String.valueOf(data.getOrderCode());
        System.out.println(">>> DEBUG [handlePaymentWebhook] Webhook triggered. transactionId: " + transactionId);
        Order order = orderRepository.findByTransactionId(transactionId).orElse(null);

        if (order != null) {
            System.out.println(">>> DEBUG [handlePaymentWebhook] Order found. status: " + order.getStatus()
                    + ", webhook payload code: " + data.getCode());
        }

        if (order != null && order.getStatus() == 0) {
            System.out.println(">>> DEBUG [handlePaymentWebhook] Proceeding to processSuccessfulOrder...");
            processSuccessfulOrder(order);
            saveTransaction(data, order);
            System.out.println(">>> DEBUG [handlePaymentWebhook] Processed successfully.");
        }
    }

    @Transactional
    public void syncPayment(PaymentLink paymentLink) {
        String transactionId = String.valueOf(paymentLink.getOrderCode());
        Order order = orderRepository.findByTransactionId(transactionId).orElse(null);

        System.out.println(">>> DEBUG [syncPayment] transactionId (orderCode): " + transactionId);
        System.out.println(">>> DEBUG [syncPayment] Order found in DB: " + (order != null));
        if (order != null) {
            System.out.println(">>> DEBUG [syncPayment] Order status in DB: " + order.getStatus());
        }
        System.out.println(">>> DEBUG [syncPayment] PayOS PaymentLink status: " + paymentLink.getStatus());

        String status = paymentLink.getStatus() != null ? paymentLink.getStatus().toString() : "";
        boolean isPaid = status.trim().equalsIgnoreCase("PAID");
        boolean isPendingOrder = order != null && order.getStatus() == 0;

        System.out.println(">>> DEBUG [syncPayment] Evaluated conditions -> isPaid: " + isPaid + ", isPendingOrder: "
                + isPendingOrder);

        if (isPaid && isPendingOrder) {
            System.out.println(">>> DEBUG [syncPayment] Conditions MET. Calling processSuccessfulOrder...");
            processSuccessfulOrder(order);
            saveTransactionFromLink(paymentLink, order);
            System.out.println(">>> DEBUG [syncPayment] Sync flow completed.");
        } else {
            System.out.println(">>> DEBUG [syncPayment] Conditions NOT MET. Skipping processing.");
        }
    }

    @Transactional
    public void saveTransactionFromLink(PaymentLink link, Order order) {
        if (!transactionRepository.findByOrder(order).isEmpty()) {
            return;
        }

        Transaction transaction = new Transaction();
        transaction.setTransactionCode(link.getId());
        transaction.setAmount((double) link.getAmountPaid());
        transaction.setStatus(1);
        transaction.setPaymentMethod("PAYOS_SYNC");
        transaction.setRef("PayOS Sync Order: " + link.getOrderCode());
        transaction.setType(1);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setOrder(order);
        transaction.setLog("{\"message\":\"Manual sync from PayOS status\"}");

        transactionRepository.save(transaction);
    }

    @Transactional
    public void processSuccessfulOrder(Order order) {
        System.out.println(">>> DEBUG [processSuccessfulOrder] Started for order ID: " + order.getId());
        if (order == null || order.getStatus() == 1) {
            System.out.println(
                    ">>> DEBUG [processSuccessfulOrder] Aborted! Order is null or already processed (status=1)");
            return;
        }

        order.setStatus(1);
        orderRepository.save(order);
        System.out.println(">>> DEBUG [processSuccessfulOrder] Updated order status to 1");

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        System.out.println(">>> DEBUG [processSuccessfulOrder] Found " + details.size() + " order details.");
        for (OrderDetail detail : details) {
            try {
                System.out.println(
                        ">>> DEBUG [processSuccessfulOrder] Processing course ID: " + detail.getCourse().getId());
                // 1. Check for existing enrollment to avoid unique constraint violations
                Optional<Enrollment> existingEnrollment = enrollmentRepository
                        .findByAccountAndCourse(order.getAccount(), detail.getCourse());
                if (existingEnrollment.isEmpty()) {
                    Enrollment enrollment = new Enrollment();
                    enrollment.setAccount(order.getAccount());
                    enrollment.setCourse(detail.getCourse());
                    enrollment.setProgressPercent(0);
                    enrollment.setStatus(1); // 1: Active
                    enrollmentRepository.save(enrollment);
                    System.out.println(">>> DEBUG [processSuccessfulOrder] Saved Enrollment successfully!");
                } else {
                    System.out
                            .println(">>> DEBUG [processSuccessfulOrder] Student already enrolled. Skipping creation.");
                }

                // 2. Credit Instructor Wallet (Net = 90% Price)
                Account instructor = detail.getCourse().getAccount();
                if (instructor != null) {
                    double platformFeeRate = 0.1; // 10% platform fee
                    double totalAmount = detail.getPrice();
                    double platformFee = totalAmount * platformFeeRate;
                    double netAmount = totalAmount - platformFee;

                    System.out.println(">>> DEBUG [processSuccessfulOrder] Instructor found: " + instructor.getEmail());
                    Wallet wallet = walletRepository.findByAccount(instructor).orElseGet(() -> {
                        System.out.println(">>> DEBUG [processSuccessfulOrder] Creating new Wallet for instructor");
                        Wallet newWallet = new Wallet();
                        newWallet.setAccount(instructor);
                        newWallet.setRemain(0.0);
                        newWallet.setStatus(1);
                        return newWallet;
                    });

                    double currentRemain = wallet.getRemain() != null ? wallet.getRemain() : 0.0;
                    wallet.setRemain(currentRemain + netAmount);
                    walletRepository.save(wallet);
                    System.out.println(">>> DEBUG [processSuccessfulOrder] Added " + netAmount
                            + " to instructor wallet (Fee: " + platformFee + ").");

                    // 3. Log Revenue Transaction for Instructor
                    Transaction revenueTransaction = new Transaction();
                    revenueTransaction.setAmount(netAmount);
                    revenueTransaction.setType(1); // 1: Nạp/Cộng tiền
                    revenueTransaction.setStatus(1); // 1: Thành công
                    revenueTransaction.setPaymentMethod("REVENUE");
                    revenueTransaction.setRef("Doanh thu từ khóa học: " + detail.getCourse().getTitle());
                    revenueTransaction.setCreatedAt(LocalDateTime.now());
                    revenueTransaction.setOrder(order);
                    revenueTransaction.setAccount(instructor);

                    try {
                        Map<String, Object> logData = new HashMap<>();
                        logData.put("course_id", detail.getCourse().getId());
                        logData.put("original_price", totalAmount);
                        logData.put("platform_fee", platformFee);
                        revenueTransaction.setLog(objectMapper.writeValueAsString(logData));
                    } catch (Exception e) {
                        System.err.println(
                                ">>> DEBUG [processSuccessfulOrder] Error logging revenue json: " + e.getMessage());
                    }

                    transactionRepository.save(revenueTransaction);
                }
            } catch (Exception e) {
                System.err.println(">>> DEBUG [processSuccessfulOrder] EXCEPTION: " + e.getMessage());
                e.printStackTrace();
                throw e; // Relaunch to ensure rollback
            }
        }
        System.out.println(">>> DEBUG [processSuccessfulOrder] DONE!");
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
            Map<String, Object> logData = new HashMap<>();
            logData.put("webhook_full_data", data);
            logData.put("payer_name", data.getCounterAccountName() != null ? data.getCounterAccountName() : "N/A");
            logData.put("description", data.getDescription() != null ? data.getDescription() : "");
            logData.put("transaction_date", data.getTransactionDateTime() != null ? data.getTransactionDateTime() : "");

            transaction.setLog(objectMapper.writeValueAsString(logData));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }

        transactionRepository.save(transaction);
    }
}
