package com.gnostica.modules.payment.service;

import com.gnostica.core.config.VNPayProperties;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class VNPayReconciliationScheduler {

    private final VNPayProperties properties;
    private final OrderRepository orderRepository;
    private final PaymentService paymentService;

    @Scheduled(fixedDelayString = "${vnpay.polling-interval-ms:2000}")
    public void reconcilePendingPaymentsWhenIpnIsUnavailable() {
        if (hasIpnUrl()) {
            return;
        }

        LocalDateTime createdAfter = LocalDateTime.now()
                .minusMinutes(Math.max(1, properties.getExpireMinutes()));
        List<Order> pendingOrders = orderRepository
                .findTop50ByStatusAndPaymentMethodIgnoreCaseAndCreatedAtAfterOrderByCreatedAtAsc(
                        OrderStatus.PENDING, "VNPAY", createdAfter);

        for (Order order : pendingOrders) {
            try {
                paymentService.checkPaymentStatus(order);
            } catch (Exception exception) {
                log.warn("Unable to reconcile VNPay order {}: {}",
                        order.getOrderCode(), exception.getMessage());
            }
        }
    }

    private boolean hasIpnUrl() {
        return properties.getIpnUrl() != null && !properties.getIpnUrl().isBlank();
    }
}
