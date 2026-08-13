package com.gnostica.modules.user.controller;

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
    public ResponseEntity<?> getStats(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getStats(authentication.getName()));
    }

    @GetMapping("/revenue-chart")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRevenueChart(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getRevenueChart(authentication.getName()));
    }

    @GetMapping("/rating-distribution")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getRatingDistribution(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getRatingDistribution(authentication.getName()));
    }

    @GetMapping("/student-growth")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getStudentGrowthChart(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getStudentGrowthChart(authentication.getName()));
    }

    @GetMapping("/course-performance")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getCoursePerformance(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getCoursePerformance(authentication.getName()));
    }

    @GetMapping("/questions")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getQuestions(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getQuestions(authentication.getName()));
    }

    @GetMapping("/reviews")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getReviews(org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(instructorDashboardService.getReviews(authentication.getName()));
    }

    @GetMapping("/test-reviews")
    public ResponseEntity<?> testReviews(@RequestParam String email) {
        try {
            return ResponseEntity.ok(instructorDashboardService.getReviews(email));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage() + "\n" + java.util.Arrays.toString(e.getStackTrace()));
        }
    }
}

