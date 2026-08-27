package com.gnostica.modules.course.service;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Report;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.modules.course.dto.request.CourseReportRequest;
import com.gnostica.modules.course.dto.request.ResolveCourseReportRequest;
import com.gnostica.modules.course.dto.response.AdminCourseReportResponse;
import com.gnostica.modules.user.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseReportService {
    private final ReportRepository reportRepository;
    private final CourseRepository courseRepository;
    private final AccountRepository accountRepository;
    private final NotificationService notificationService;

    @Transactional
    public void submitReport(String email, String slug, CourseReportRequest request) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        if (course.getStatus() != 1) {
            throw new com.gnostica.core.exception.BadRequestException("Chỉ có thể báo cáo khóa học đang được công khai");
        }

        boolean hasPending = reportRepository.existsByTargetIdAndTargetTypeAndAccount_EmailAndStatus(
                course.getId().toString(), "COURSE", email, 1);

        if (hasPending) {
            throw new com.gnostica.core.exception.BadRequestException("Bạn đã có một báo cáo đang chờ xử lý cho khóa học này.");
        }

        Report report = Report.builder()
                .account(account)
                .targetId(course.getId().toString())
                .targetType("COURSE")
                .reason(request.getReason())
                .status(1) // 1 = Pending
                .build();

        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public boolean hasPendingReport(String email, String slug) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug).orElse(null);
        if (course == null) return false;
        return reportRepository.existsByTargetIdAndTargetTypeAndAccount_EmailAndStatus(
                course.getId().toString(), "COURSE", email, 1);
    }

    @Transactional(readOnly = true)
    public Page<AdminCourseReportResponse> getAdminCourseReports(String statusFilter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Report> reports;
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("all")) {
            int status = 1;
            if (statusFilter.equalsIgnoreCase("resolved")) status = 3;
            else if (statusFilter.equalsIgnoreCase("dismissed")) status = 4;
            
            reports = reportRepository.findByTargetTypeAndStatus("COURSE", status, pageable);
        } else {
            reports = reportRepository.findByTargetType("COURSE", pageable);
        }

        return reports.map(this::mapToAdminResponse);
    }

    @Transactional
    public void resolveReport(Integer reportId, ResolveCourseReportRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        if (report.getStatus() != 1) {
            throw new RuntimeException("Báo cáo này đã được xử lý");
        }

        Course course = courseRepository.findById(UUID.fromString(report.getTargetId()))
                .orElse(null);

        if (course == null) {
            report.setStatus(4); // Dismissed
            reportRepository.save(report);
            return;
        }

        if ("DISMISS".equalsIgnoreCase(request.getAction())) {
            report.setStatus(4); // 4 = Dismissed
            reportRepository.save(report);
            
            notificationService.createNotification(report.getAccount(), 
                "Kết quả báo cáo khóa học", 
                "Báo cáo của bạn đối với khóa học '" + course.getTitle() + "' không phát hiện vi phạm. Cảm ơn bạn đã quan tâm.", 
                "SYSTEM"
            );
            
        } else if ("HIDE_COURSE".equalsIgnoreCase(request.getAction())) {
            report.setStatus(3); // 3 = Resolved
            reportRepository.save(report);

            String finalReason = (request.getReason() != null && !request.getReason().isBlank()) ? request.getReason() : report.getReason();
            finalReason = "[Báo cáo] " + finalReason;

            // Hide V1
            course.setStatus(3); // 3 = Rejected/Hidden
            course.setRejectReason(finalReason);
            courseRepository.save(course);

            // Hide V2 if exists and pending/draft
            courseRepository.findFirstByOriginalCourseAndDeletedAtIsNullOrderByIdDesc(course).ifPresent(v2 -> {
                if (v2.getStatus() == 2 || v2.getStatus() == 4) {
                    v2.setStatus(3);
                    v2.setRejectReason(finalReason);
                    courseRepository.save(v2);
                }
            });

            // Warn instructor
            notificationService.createNotification(course.getAccount(), 
                "Khóa học bị ẩn do vi phạm", 
                "Khóa học '" + course.getTitle() + "' của bạn đã bị ẩn. Lý do: " + finalReason + ". Vui lòng khắc phục.", 
                "WARNING"
            );

            // Thank reporter
            notificationService.createNotification(report.getAccount(), 
                "Kết quả báo cáo khóa học", 
                "Báo cáo của bạn đối với khóa học '" + course.getTitle() + "' là chính xác. Chúng tôi đã tiến hành ẩn khóa học và cảnh cáo giảng viên. Cảm ơn sự đóng góp của bạn.", 
                "SYSTEM"
            );
        } else {
            throw new RuntimeException("Hành động không hợp lệ");
        }
    }

    private AdminCourseReportResponse mapToAdminResponse(Report report) {
        Course course = courseRepository.findById(UUID.fromString(report.getTargetId())).orElse(null);
        
        String statusStr = "pending";
        if (report.getStatus() == 3) statusStr = "resolved";
        else if (report.getStatus() == 4) statusStr = "dismissed";

        return AdminCourseReportResponse.builder()
                .id(report.getId().toString())
                .courseId(course != null ? course.getId().toString() : "")
                .courseSlug(course != null ? course.getSlug() : "")
                .courseTitle(course != null ? course.getTitle() : "Khóa học đã bị xóa")
                .thumbnail(course != null ? course.getThumbnail() : "")
                .instructorName(course != null && course.getAccount() != null ? course.getAccount().getFullName() : "")
                .reporterName(report.getAccount() != null ? report.getAccount().getFullName() : "")
                .reportDetails(report.getReason())
                .createdAt(report.getCreatedAt())
                .status(statusStr)
                .build();
    }
}
