package com.gnostica.core.listener;

import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.GiftRepository;
import com.gnostica.modules.user.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class EnrollmentListener {

    private final EnrollmentRepository enrollmentRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final NotificationService notificationService;
    private final GiftRepository giftRepository;
    private final com.gnostica.modules.checkout.service.GiftService giftService;

    @EventListener
    @Transactional
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        Order order = event.getOrder();
        
        // Skip auto-enrollment for gift orders
        if (giftRepository.existsByOrder(order)) {
            log.info("Gift order {} - skip auto enrollment and process gift", order.getId());
            giftService.processPaidGiftOrder(order);
            return;
        }
        
        log.info("Processing enrollment for order ID: {}", order.getId());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail detail : details) {
            Optional<Enrollment> existingEnrollment = enrollmentRepository
                    .findByAccountAndCourse(order.getAccount(), detail.getCourse());

            if (existingEnrollment.isPresent() && existingEnrollment.get().getStatus() != null
                    && existingEnrollment.get().getStatus() == 0) {
                // Refunded/dropped enrollment (status 0) is re-activated on a new
                // purchase. The unique constraint (account_id, course_id) means we
                // cannot create a second row, so the existing row is restored.
                Enrollment enrollment = existingEnrollment.get();
                enrollment.setStatus(1); // 1: Active
                enrollment.setOrderDetail(detail);
                enrollment.setProgressPercent(0);
                enrollment.setCompletedAt(null);
                enrollmentRepository.save(enrollment);
                log.info("Re-activated enrollment for student {} in course {}", order.getAccount().getEmail(),
                        detail.getCourse().getTitle());

                notificationService.createNotification(order.getAccount(), "Đăng ký khóa học thành công",
                        "Bạn đã đăng ký lại thành công khóa học '" + detail.getCourse().getTitle() + "'. Chúc bạn học tập tốt!", "ENROLLMENT");
                notificationService.createNotification(detail.getCourse().getAccount(), "Có học viên mới",
                        "Học viên " + order.getAccount().getFullName() + " vừa mua lại khóa học '" + detail.getCourse().getTitle() + "' của bạn.", "SYSTEM");
            } else if (existingEnrollment.isEmpty()) {
                Enrollment enrollment = new Enrollment();
                enrollment.setAccount(order.getAccount());
                enrollment.setCourse(detail.getCourse());
                enrollment.setOrderDetail(detail);
                enrollment.setProgressPercent(0);
                enrollment.setStatus(1); // 1: Active
                enrollmentRepository.save(enrollment);
                log.info("Enrolled student {} in course {}", order.getAccount().getEmail(),
                        detail.getCourse().getTitle());
                        
                // Bắn thông báo cho User mua khóa học
                notificationService.createNotification(order.getAccount(), "Đăng ký khóa học thành công",
                        "Bạn đã đăng ký thành công khóa học '" + detail.getCourse().getTitle() + "'. Chúc bạn học tập tốt!", "ENROLLMENT");
                
                // Bắn thông báo cho Giảng viên (Instructor)
                notificationService.createNotification(detail.getCourse().getAccount(), "Có học viên mới",
                        "Học viên " + order.getAccount().getFullName() + " vừa mua khóa học '" + detail.getCourse().getTitle() + "' của bạn.", "SYSTEM");
            } else {
                log.info("Student already enrolled in course: {}", detail.getCourse().getTitle());
            }
        }
    }
}


