package com.gnostica.modules.order.scheduler;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.config.VNPayProperties;
import com.gnostica.modules.order.service.PendingOrderCancellationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {
    private static final int PAYOS_PAYMENT_EXPIRY_MINUTES = 5;

    private final OrderRepository orderRepository;
    private final VNPayProperties vnPayProperties;
    private final PendingOrderCancellationService pendingOrderCancellationService;

    /**
     * Chạy định kỳ mỗi 1 tiếng (3600000 ms)
     * Quét các đơn hàng đang PENDING (0) tạo trước đó 24h và tự động chuyển thành CANCELLED (3)
     */
    @Scheduled(fixedRateString = "${order.cleanup-interval-ms:60000}")
    public void cancelExpiredPendingOrders() {
        LocalDateTime vnpayExpiry = LocalDateTime.now()
                .minusMinutes(Math.max(1, vnPayProperties.getExpireMinutes()));
        cancelOrders(orderRepository.findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
                OrderStatus.PENDING, "VNPAY", vnpayExpiry));

        LocalDateTime payosExpiry = LocalDateTime.now().minusMinutes(PAYOS_PAYMENT_EXPIRY_MINUTES);
        cancelOrders(orderRepository.findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
                OrderStatus.PENDING, "PAYOS", payosExpiry));

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        cancelOrders(orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, twentyFourHoursAgo));
    }

    private void cancelOrders(List<Order> expiredOrders) {
        if (expiredOrders.isEmpty()) {
            return;
        }
        log.info("Cancelling {} expired pending orders.", expiredOrders.size());
        for (Order order : expiredOrders) {
            try {
                pendingOrderCancellationService.cancelPendingOrder(order.getOrderCode(), "Payment window expired", false);
            } catch (Exception exception) {
                log.warn("Unable to cancel expired order {}: {}", order.getOrderCode(), exception.getMessage());
            }
        }
    }
}
