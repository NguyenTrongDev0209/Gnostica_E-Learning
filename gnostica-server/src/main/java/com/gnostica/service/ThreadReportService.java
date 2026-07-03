package com.gnostica.service;

import com.gnostica.dto.request.ThreadReportRequest;
import com.gnostica.dto.response.ThreadReportResponse;
import com.gnostica.core.model.ThreadReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ThreadReportService {
    ThreadReportResponse createReport(ThreadReportRequest request);
    Page<ThreadReportResponse> getAllReports(Pageable pageable);
    ThreadReportResponse updateReportStatus(Integer id, String status);
    boolean hasUserReportedThread(Integer threadId, String email);
}
