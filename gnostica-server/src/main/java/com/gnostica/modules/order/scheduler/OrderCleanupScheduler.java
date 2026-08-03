package com.gnostica.modules.order.scheduler;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.config.VNPayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final VNPayProperties vnPayProperties;

    /**
     * Chạy định kỳ mỗi 1 tiếng (3600000 ms)
     * Quét các đơn hàng đang PENDING (0) tạo trước đó 24h và tự động chuyển thành CANCELLED (3)
     */
    @Scheduled(fixedRateString = "${order.cleanup-interval-ms:60000}")
    @Transactional
    public void cancelExpiredPendingOrders() {
        LocalDateTime vnpayExpiry = LocalDateTime.now()
                .minusMinutes(Math.max(1, vnPayProperties.getExpireMinutes()));
        cancelOrders(orderRepository.findByStatusAndPaymentMethodIgnoreCaseAndCreatedAtBefore(
                OrderStatus.PENDING, "VNPAY", vnpayExpiry));

        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        cancelOrders(orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, twentyFourHoursAgo));
    }

    private void cancelOrders(List<Order> expiredOrders) {
        if (expiredOrders.isEmpty()) {
            return;
        }
        log.info("Cancelling {} expired pending orders.", expiredOrders.size());
        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);
            if (order.getCoupon() != null && order.getCoupon().getReservedQuantity() != null) {
                order.getCoupon().setReservedQuantity(Math.max(0, order.getCoupon().getReservedQuantity() - 1));
                couponRepository.save(order.getCoupon());
            }
        }
    }
}
