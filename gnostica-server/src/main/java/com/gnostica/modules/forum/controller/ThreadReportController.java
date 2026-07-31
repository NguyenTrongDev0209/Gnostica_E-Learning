package com.gnostica.modules.forum.controller;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Report;
import com.gnostica.core.model.Thread;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.modules.forum.dto.request.ThreadReportRequest;
import com.gnostica.modules.forum.dto.response.ThreadReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/thread-reports")
@RequiredArgsConstructor
public class ThreadReportController {

    private final ReportRepository reportRepository;
    private final AccountRepository accountRepository;
    private final ThreadRepository threadRepository;

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkReportStatus(
            @RequestParam Integer threadId,
            @RequestParam String email) {
        boolean exists = reportRepository.existsByTargetIdAndTargetTypeAndAccount_Email(
                threadId.toString(), "THREAD", email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping
    public ResponseEntity<?> createReport(@RequestBody ThreadReportRequest request) {
        String userEmail = request.getEffectiveEmail();
        if (userEmail == null || userEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng đăng nhập để gửi báo cáo"));
        }

        if (request.getThreadId() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu ID bài viết"));
        }

        Optional<Account> accountOpt = accountRepository.findByEmail(userEmail);
        if (accountOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tài khoản không tồn tại"));
        }

        Optional<Thread> threadOpt = threadRepository.findById(request.getThreadId());
        if (threadOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Bài viết không tồn tại"));
        }

        boolean alreadyReported = reportRepository.existsByTargetIdAndTargetTypeAndAccount_Email(
                request.getThreadId().toString(), "THREAD", userEmail);
        if (alreadyReported) {
            return ResponseEntity.badRequest().body(Map.of("message", "Bạn đã báo cáo bài viết này rồi"));
        }

        String reason = request.getEffectiveReason();
        if (reason == null || reason.isBlank()) {
            reason = "OTHER";
        }

        Report report = Report.builder()
                .account(accountOpt.get())
                .targetId(request.getThreadId().toString())
                .targetType("THREAD")
                .reason(reason)
                .description(request.getEffectiveDetails() != null ? request.getEffectiveDetails() : null)
                .status(1)
                .build();

        Report saved = reportRepository.save(report);

        ThreadReportResponse response = ThreadReportResponse.builder()
                .id(saved.getId())
                .threadId(request.getThreadId())
                .threadContent(threadOpt.get().getTitle())
                .reporterName(accountOpt.get().getFullName())
                .reporterEmail(accountOpt.get().getEmail())
                .type(saved.getReason())
                .details(request.getEffectiveDetails())
                .status("PENDING")
                .createdAt(saved.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<ThreadReportResponse>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Report> reports = reportRepository.findAll(pageable);

        Page<ThreadReportResponse> responsePage = reports.map(r -> {
            Integer threadId = null;
            try {
                threadId = Integer.parseInt(r.getTargetId());
            } catch (Exception ignored) {}

            String statusStr = "PENDING";
            if (r.getStatus() != null) {
                if (r.getStatus() == 3) statusStr = "RESOLVED";
                else if (r.getStatus() == 4) statusStr = "DISMISSED";
                else if (r.getStatus() == 2) statusStr = "PROCESSING";
            }

            return ThreadReportResponse.builder()
                    .id(r.getId())
                    .threadId(threadId)
                    .reporterName(r.getAccount() != null ? r.getAccount().getFullName() : "Ẩn danh")
                    .reporterEmail(r.getAccount() != null ? r.getAccount().getEmail() : "")
                    .type(r.getReason())
                    .details(r.getDescription())
                    .status(statusStr)
                    .createdAt(r.getCreatedAt())
                    .build();
        });

        return ResponseEntity.ok(responsePage);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Report report = reportOpt.get();
        Object statusObj = body.get("status");
        if (statusObj != null) {
            String s = statusObj.toString();
            if ("RESOLVED".equalsIgnoreCase(s) || "3".equals(s)) {
                report.setStatus(3);
            } else if ("DISMISSED".equalsIgnoreCase(s) || "4".equals(s)) {
                report.setStatus(4);
            } else if ("PENDING".equalsIgnoreCase(s) || "1".equals(s)) {
                report.setStatus(1);
            } else {
                report.setStatus(2);
            }
            reportRepository.save(report);
        }

        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }
}
