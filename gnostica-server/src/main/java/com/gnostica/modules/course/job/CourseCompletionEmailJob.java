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

/**
 * Course completion email job.
 * 
 * Note: Email gửi khi hoàn thành khóa học đã được xử lý trực tiếp 
 * trong EnrollmentService.updateProgress() và EnrollmentService.convertToDTO().
 * Job này được giữ lại như placeholder cho các tác vụ nền tương lai.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseCompletionEmailJob {

    private final EnrollmentRepository enrollmentRepository;
    private final MailService mailService;

}
