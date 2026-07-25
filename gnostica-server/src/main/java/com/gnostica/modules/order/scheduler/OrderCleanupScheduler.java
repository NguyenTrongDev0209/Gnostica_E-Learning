package com.gnostica.modules.order.scheduler;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
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

    /**
     * Chạy định kỳ mỗi 1 tiếng (3600000 ms)
     * Quét các đơn hàng đang PENDING (0) tạo trước đó 24h và tự động chuyển thành CANCELLED (2)
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cancelExpiredPendingOrders() {
        LocalDateTime twentyFourHoursAgo = LocalDateTime.now().minusHours(24);
        
        List<Order> expiredOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, twentyFourHoursAgo);
        
        if (!expiredOrders.isEmpty()) {
            log.info("Found {} expired pending orders. Cancelling them...", expiredOrders.size());
            for (Order order : expiredOrders) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
            log.info("Finished cancelling expired orders.");
        }
    }
}
