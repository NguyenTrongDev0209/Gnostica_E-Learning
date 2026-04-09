package com.gnostica.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.gnostica.model.Account;
import com.gnostica.model.Order;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.OrderDetailRepository;
import com.gnostica.repository.OrderRepository;

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
    private final AccountRepository accountRepository;

    public WebhookData verifyWebhook(Object body) throws JsonProcessingException, IllegalArgumentException {
        return payOS.webhooks().verify(body);
    }
    
    @Transactional
    public void processSuccessfulOrder(Long orderId) {
        Order order = orderRepository.findById(orderId.intValue()).orElse(null);
        if (order == null || order.getStatus() == 1) {
            return; // Already paid or not found
        }

        // 1. Mark Order as PAID
        order.setStatus(1);
        orderRepository.save(order);

        // 2. Find Course Instructor and add balance
        orderDetailRepository.findByOrderId(orderId).ifPresent(detail -> {
            Account instructor = detail.getCourse().getInstructor();
            if (instructor != null) {
                double currentRemain = instructor.getRemain() != null ? instructor.getRemain() : 0.0;
                // Add the price PAID by student (order.totalPrice includes discounts)
                instructor.setRemain(currentRemain + order.getTotalPrice());
                accountRepository.save(instructor);
                System.out.println("Added " + order.getTotalPrice() + " to instructor: " + instructor.getUsername());
            }
        });
    }
}
