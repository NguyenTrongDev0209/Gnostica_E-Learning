package com.gnostica.modules.user.controller;

import com.gnostica.modules.user.service.AdminUserDetailService;
import com.gnostica.core.dto.response.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users/{userId}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserDetailController {

    @Autowired
    private AdminUserDetailService adminUserDetailService;

    @GetMapping("/summary")
    public ResponseEntity<?> getUserSummary(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserSummary(userId)));
    }

    @GetMapping("/enrollments")
    public ResponseEntity<?> getUserEnrollments(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserEnrollments(userId, pageable)));
    }

    @GetMapping("/enrollments/{enrollmentId}/progress")
    public ResponseEntity<?> getEnrollmentProgress(@PathVariable UUID userId, @PathVariable Integer enrollmentId) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getEnrollmentProgress(enrollmentId)));
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getUserCourses(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserCourses(userId, pageable)));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getUserOrders(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserOrders(userId, pageable)));
    }

    @GetMapping("/orders/{orderId}/details")
    public ResponseEntity<?> getOrderDetails(@PathVariable UUID userId, @PathVariable UUID orderId) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getOrderDetails(orderId)));
    }

    @GetMapping("/incomes")
    public ResponseEntity<?> getUserIncomes(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserIncomes(userId, pageable)));
    }

    @GetMapping("/payouts")
    public ResponseEntity<?> getUserPayouts(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserPayouts(userId, pageable)));
    }

    @GetMapping("/threads")
    public ResponseEntity<?> getUserThreads(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserThreads(userId, pageable)));
    }

    @GetMapping("/reviews")
    public ResponseEntity<?> getUserReviews(@PathVariable UUID userId, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserReviews(userId, pageable)));
    }

    @GetMapping("/activities")
    public ResponseEntity<?> getUserActivities(@PathVariable UUID userId, @org.springframework.data.web.PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(adminUserDetailService.getUserActivities(userId, pageable)));
    }
}
