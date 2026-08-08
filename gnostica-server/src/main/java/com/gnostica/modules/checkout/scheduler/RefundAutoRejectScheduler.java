package com.gnostica.modules.checkout.scheduler;

import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.constant.RefundStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.model.Refund;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.core.repository.RefundRepository;
import com.gnostica.modules.checkout.service.RefundService;
import com.gnostica.modules.user.service.NotificationService;
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
public class RefundAutoRejectScheduler {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    // Run every day at 00:00:00
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void rejectExpiredRefunds() {
        log.info("Starting RefundAutoRejectScheduler...");
        List<Refund> pendingRefunds = refundRepository.findByStatusOrderByCreatedAtDesc(RefundStatus.PENDING);
        int rejectedCount = 0;

        for (Refund refund : pendingRefunds) {
            Order order = refund.getOrderDetail().getOrder();
            List<Payment> payments = paymentRepository.findByOrder(order);

            LocalDateTime paidAtLocal = null;
            for (Payment p : payments) {
                if (p.getStatus() == PaymentStatus.SUCCESS && p.getPaidAt() != null) {
                    paidAtLocal = p.getPaidAt();
                    break;
                }
            }
            if (paidAtLocal == null) {
                paidAtLocal = order.getCreatedAt();
            }

            if (LocalDateTime.now().isAfter(paidAtLocal.plusDays(RefundService.INSTRUCTOR_HOLD_DAYS))) {
                refund.setStatus(RefundStatus.REJECTED);
                refund.setReason(refund.getReason() + " | Từ chối tự động: " + RefundService.AUTO_REJECT_REASON);
                refundRepository.save(refund);

                notificationService.createNotification(
                        refund.getAccount(),
                        "Yêu cầu hoàn tiền bị từ chối",
                        "Yêu cầu hoàn tiền khóa học " + refund.getOrderDetail().getCourse().getTitle() + " đã bị từ chối. Lý do: " + RefundService.AUTO_REJECT_REASON,
                        "REFUND_REJECTED",
                        refund.getId().toString()
                );
                rejectedCount++;
            }
        }
        log.info("Finished RefundAutoRejectScheduler. Rejected {} expired refunds.", rejectedCount);
    }
}
