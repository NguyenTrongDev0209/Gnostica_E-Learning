package com.gnostica.modules.user.controller;

import com.gnostica.modules.user.dto.request.InstructorApplicationRequest;
import com.gnostica.modules.user.dto.request.RejectApplicationRequest;
import com.gnostica.modules.user.dto.response.InstructorApplicationResponse;
import com.gnostica.modules.user.service.InstructorApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor-applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust if needed
public class InstructorApplicationController {

    private final InstructorApplicationService applicationService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MEMBER', 'USER', 'ROLE_MEMBER', 'ROLE_USER')") 
    public ResponseEntity<?> submitApplication(Authentication authentication,
                                               @Valid @RequestBody InstructorApplicationRequest request) {
        try {
            String email = authentication.getName();
            applicationService.submitApplication(email, request);
            return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<InstructorApplicationResponse>> getAllApplications(
            @RequestParam(required = false) String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(applicationService.getPendingApplications());
        }
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> approveApplication(@PathVariable Integer id) {
        try {
            applicationService.approveApplication(id);
            return ResponseEntity.ok(Map.of("message", "Application approved"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> rejectApplication(@PathVariable Integer id,
                                               @Valid @RequestBody RejectApplicationRequest request) {
        try {
            applicationService.rejectApplication(id, request);
            return ResponseEntity.ok(Map.of("message", "Application rejected"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
