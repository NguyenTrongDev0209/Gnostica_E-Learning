package com.gnostica.modules.course.job;
import com.gnostica.modules.integration.service.MailService;

import com.gnostica.core.model.Enrollment;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.modules.integration.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseCompletionEmailJob {

    private final EnrollmentRepository enrollmentRepository;
    private final MailService mailService;

    // Run every 5 minutes
    @Scheduled(fixedRate = 300000)
    public void sendEmailsForCompletedCourses() {
        log.info("Starting CourseCompletionEmailJob to find completed courses without email...");

        List<Enrollment> pendingEnrollments = enrollmentRepository.findCompletedEnrollmentsWithoutEmail();
        
        if (pendingEnrollments.isEmpty()) {
            log.info("No pending course completion emails found.");
            return;
        }

        log.info("Found {} pending course completion emails. Sending now...", pendingEnrollments.size());

        int count = 0;
        for (Enrollment enrollment : pendingEnrollments) {
            try {
                mailService.sendCourseCompletionEmail(enrollment);
                enrollment.setCertificateEmailSent(true);
                enrollmentRepository.save(enrollment);
                count++;
            } catch (Exception e) {
                log.error("Failed to send course completion email for enrollment id: {}", enrollment.getId(), e);
            }
        }

        log.info("CourseCompletionEmailJob finished. Successfully sent {}/{} emails.", count, pendingEnrollments.size());
    }
}
