package com.gnostica.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gnostica.model.Account;
import com.gnostica.model.Order;
import com.gnostica.model.Wallet;
import com.gnostica.repository.OrderDetailRepository;
import com.gnostica.repository.OrderRepository;
import com.gnostica.repository.WalletRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public WebhookData verifyWebhook(Object body) throws JsonProcessingException, IllegalArgumentException {
        return payOS.webhooks().verify(body);
    }

    @Transactional
    public void processSuccessfulOrder(Long orderId) {
        Order order = orderRepository.findById(orderId.intValue()).orElse(null);
        if (order == null || order.getStatus() == 1) {
            return;
        }

        order.setStatus(1);
        orderRepository.save(order);

        orderDetailRepository.findByOrderId(orderId).ifPresent(detail -> {
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
                wallet.setRemain(currentRemain + order.getTotalPrice());
                walletRepository.save(wallet);
                System.out.println("Added " + order.getTotalPrice() + " to instructor: " + instructor.getEmail());
            }
        });
    }
}
