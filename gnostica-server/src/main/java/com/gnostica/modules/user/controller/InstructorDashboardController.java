package com.gnostica.modules.user.controller;
import com.gnostica.service.*;

import com.gnostica.modules.user.service.InstructorDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructor-dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InstructorDashboardController {

    @Autowired
    private InstructorDashboardService instructorDashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getStats(userDetails.getUsername()));
    }

    @GetMapping("/revenue-chart")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueChart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getRevenueChart(userDetails.getUsername()));
    }

    @GetMapping("/rating-distribution")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRatingDistribution(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getRatingDistribution(userDetails.getUsername()));
    }

    @GetMapping("/student-growth")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getStudentGrowthChart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getStudentGrowthChart(userDetails.getUsername()));
    }

    @GetMapping("/course-performance")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCoursePerformance(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getCoursePerformance(userDetails.getUsername()));
    }

    @GetMapping("/questions")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getQuestions(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getQuestions(userDetails.getUsername()));
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getReviews(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(instructorDashboardService.getReviews(userDetails.getUsername()));
    }
}
