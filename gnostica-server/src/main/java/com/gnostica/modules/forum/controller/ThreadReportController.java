package com.gnostica.modules.forum.controller;

import com.gnostica.modules.forum.dto.request.ThreadReportRequest;
import com.gnostica.modules.forum.dto.response.ThreadReportResponse;
import com.gnostica.modules.forum.service.ThreadReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/thread-reports")
@CrossOrigin("*")
public class ThreadReportController {

    @Autowired
    private ThreadReportService threadReportService;

    @PostMapping
    public ResponseEntity<ThreadReportResponse> createReport(@RequestBody ThreadReportRequest request) {
        ThreadReportResponse response = threadReportService.createReport(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<ThreadReportResponse>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ThreadReportResponse> reports = threadReportService.getAllReports(pageable);
        return ResponseEntity.ok(reports);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ThreadReportResponse> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        ThreadReportResponse response = threadReportService.updateReportStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkReportStatus(
            @RequestParam Integer threadId,
            @RequestParam String email) {
        return ResponseEntity.ok(threadReportService.hasUserReportedThread(threadId, email));
    }
}
