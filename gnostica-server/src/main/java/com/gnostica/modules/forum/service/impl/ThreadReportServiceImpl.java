package com.gnostica.modules.forum.service.impl;
import com.gnostica.service.*;

import com.gnostica.modules.forum.dto.request.ThreadReportRequest;
import com.gnostica.modules.forum.dto.response.ThreadReportResponse;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.ThreadReport;
import com.gnostica.core.model.Thread;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.ThreadReportRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.modules.forum.service.ThreadReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ThreadReportServiceImpl implements ThreadReportService {

    @Autowired
    private ThreadReportRepository threadReportRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Override
    public ThreadReportResponse createReport(ThreadReportRequest request) {
        Thread thread = threadRepository.findById(request.getThreadId())
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        Account reporter = accountRepository.findByEmail(request.getUserEmail())
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        if (threadReportRepository.existsByThreadIdAndReporterEmail(request.getThreadId(), request.getUserEmail())) {
            throw new RuntimeException("Bạn đã báo cáo bài viết này rồi");
        }

        ThreadReport report = new ThreadReport();
        report.setThread(thread);
        report.setReporter(reporter);
        report.setType(request.getType());
        report.setDetails(request.getDetails());
        report.setStatus("PENDING");

        ThreadReport savedReport = threadReportRepository.save(report);
        return mapToResponse(savedReport);
    }

    @Override
    public Page<ThreadReportResponse> getAllReports(Pageable pageable) {
        return threadReportRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ThreadReportResponse updateReportStatus(Integer id, String status) {
        ThreadReport report = threadReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status);
        
        Thread thread = report.getThread();
        if ("RESOLVED".equals(status)) {
            thread.setStatus(false);
        } else {
            thread.setStatus(true);
        }
        threadRepository.save(thread);
        
        ThreadReport savedReport = threadReportRepository.save(report);
        return mapToResponse(savedReport);
    }

    @Override
    public boolean hasUserReportedThread(Integer threadId, String email) {
        return threadReportRepository.existsByThreadIdAndReporterEmail(threadId, email);
    }

    private ThreadReportResponse mapToResponse(ThreadReport report) {
        return ThreadReportResponse.builder()
                .id(report.getId())
                .threadId(report.getThread().getId())
                .threadContent(report.getThread().getContent())
                .reporterName(report.getReporter().getFullName())
                .reporterEmail(report.getReporter().getEmail())
                .type(report.getType())
                .details(report.getDetails())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
