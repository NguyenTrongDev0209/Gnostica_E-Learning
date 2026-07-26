package com.gnostica.modules.user.controller;

import com.gnostica.modules.user.dto.request.RejectApplicationRequest;
import com.gnostica.modules.user.dto.response.InstructorApplicationResponse;
import com.gnostica.modules.user.service.InstructorApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/instructor-applications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminInstructorApplicationController {

    private final InstructorApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<InstructorApplicationResponse>> getAllApplications(
            @RequestParam(required = false) String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(applicationService.getPendingApplications());
        }
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PostMapping("/{accountId}/approve")
    public ResponseEntity<?> approveApplicationPost(@PathVariable UUID accountId) {
        try {
            applicationService.approveApplication(accountId);
            return ResponseEntity.ok(Map.of("message", "Application approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{accountId}/approve")
    public ResponseEntity<?> approveApplicationPut(@PathVariable UUID accountId) {
        return approveApplicationPost(accountId);
    }

    @PostMapping("/{accountId}/reject")
    public ResponseEntity<?> rejectApplicationPost(@PathVariable UUID accountId,
                                                @Valid @RequestBody RejectApplicationRequest request) {
        try {
            applicationService.rejectApplication(accountId, request);
            return ResponseEntity.ok(Map.of("message", "Application rejected successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{accountId}/reject")
    public ResponseEntity<?> rejectApplicationPut(@PathVariable UUID accountId,
                                               @Valid @RequestBody RejectApplicationRequest request) {
        return rejectApplicationPost(accountId, request);
    }
}
