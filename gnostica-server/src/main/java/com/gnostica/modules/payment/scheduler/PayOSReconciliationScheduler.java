package com.gnostica.modules.payment.scheduler;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.modules.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/** Fallback for a delayed or lost PayOS webhook in publicly deployed environments. */
@Component
@RequiredArgsConstructor
@Slf4j
public class PayOSReconciliationScheduler {
    private static final int PAYOS_EXPIRY_MINUTES = 5;

    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    @Value("${payos.webhook-enabled:false}")
    private boolean payosWebhookEnabled;

    @Scheduled(fixedDelayString = "${payos.reconciliation-interval-ms:30000}")
    public void reconcilePendingPayOSPayments() {
        // Development already polls while the checkout screen is open. In
        // production this is a safety net for missed webhook delivery.
        if (!payosWebhookEnabled) {
            return;
        }

        List<Order> pendingOrders = orderRepository.findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
                OrderStatus.PENDING, "PAYOS", LocalDateTime.now().plusMinutes(1));
        for (Order order : pendingOrders) {
            if (order.getCreatedAt() != null && order.getCreatedAt().plusMinutes(PAYOS_EXPIRY_MINUTES)
                    .isBefore(LocalDateTime.now())) {
                continue;
            }
            try {
                paymentService.checkPaymentStatus(order);
            } catch (Exception exception) {
                log.warn("Unable to reconcile PayOS order {}: {}", order.getOrderCode(), exception.getMessage());
            }
        }
    }
}
