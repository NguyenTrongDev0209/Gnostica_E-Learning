package com.gnostica.modules.payment.scheduler;

import com.gnostica.core.config.VNPayProperties;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.modules.order.service.OrderService;
import com.gnostica.modules.payment.service.PaymentService;
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
    private final OrderService orderService;

    @Scheduled(fixedDelayString = "${vnpay.polling-interval-ms:2000}")
    public void reconcileActivePendingPayments() {
        LocalDateTime expiresBefore = LocalDateTime.now()
                .minusMinutes(Math.max(1, properties.getExpireMinutes()));

        // An expired order is terminal: it is never queried again.
        List<Order> expiredOrders = orderRepository
                .findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
                        OrderStatus.PENDING, "VNPAY", expiresBefore);
        for (Order expiredOrder : expiredOrders) {
            try {
                orderService.cancelPendingOrderAtomic(expiredOrder.getOrderCode(),
                        "VNPay payment window expired", false);
            } catch (Exception exception) {
                log.warn("Unable to expire VNPay order {}: {}", expiredOrder.getOrderCode(), exception.getMessage());
            }
        }

        List<Order> pendingOrders = orderRepository
                .findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
                        OrderStatus.PENDING, "VNPAY", LocalDateTime.now());

        for (Order order : pendingOrders) {
            try {
                paymentService.checkPaymentStatus(order);
            } catch (Exception exception) {
                log.warn("Unable to reconcile VNPay order {}: {}",
                        order.getOrderCode(), exception.getMessage());
            }
        }
    }

}
