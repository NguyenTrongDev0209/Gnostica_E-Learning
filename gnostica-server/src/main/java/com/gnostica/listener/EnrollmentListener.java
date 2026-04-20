package com.gnostica.listener;

import com.gnostica.event.PaymentSuccessEvent;
import com.gnostica.model.Enrollment;
import com.gnostica.model.Order;
import com.gnostica.model.OrderDetail;
import com.gnostica.repository.EnrollmentRepository;
import com.gnostica.repository.OrderDetailRepository;
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

    @EventListener
    @Transactional
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        Order order = event.getOrder();
        log.info("Processing enrollment for order ID: {}", order.getId());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail detail : details) {
            Optional<Enrollment> existingEnrollment = enrollmentRepository
                    .findByAccountAndCourse(order.getAccount(), detail.getCourse());

            if (existingEnrollment.isEmpty()) {
                Enrollment enrollment = new Enrollment();
                enrollment.setAccount(order.getAccount());
                enrollment.setCourse(detail.getCourse());
                enrollment.setProgressPercent(0);
                enrollment.setStatus(1); // 1: Active
                enrollmentRepository.save(enrollment);
                log.info("Enrolled student {} in course {}", order.getAccount().getEmail(),
                        detail.getCourse().getTitle());
            } else {
                log.info("Student already enrolled in course: {}", detail.getCourse().getTitle());
            }
        }
    }
}
