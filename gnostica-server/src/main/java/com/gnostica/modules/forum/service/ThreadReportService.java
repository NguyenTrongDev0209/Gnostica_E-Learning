package com.gnostica.modules.forum.service;

import com.gnostica.modules.forum.dto.request.ThreadReportRequest;
import com.gnostica.modules.forum.dto.response.ThreadReportResponse;
import com.gnostica.core.model.ThreadReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ThreadReportService {
    ThreadReportResponse createReport(ThreadReportRequest request);
    Page<ThreadReportResponse> getAllReports(Pageable pageable);
    ThreadReportResponse updateReportStatus(Integer id, String status);
    boolean hasUserReportedThread(Integer threadId, String email);
}
