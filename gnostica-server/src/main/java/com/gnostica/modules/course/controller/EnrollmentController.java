package com.gnostica.modules.course.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.course.dto.response.EnrollmentDTO;
import com.gnostica.modules.course.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem danh sÃ¡ch khÃ³a há»c"));
        }
        String email = authentication.getName();
        List<EnrollmentDTO> myCourses = enrollmentService.getMyCourses(email);
        return ResponseEntity.ok(ApiResponse.success(myCourses));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getMyStats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem thá»‘ng kÃª há»c táº­p"));
        }
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.success(enrollmentService.getStudentStats(email)));
    }

    @GetMapping("/check/{courseSlug}")
    public ResponseEntity<?> checkEnrollment(@PathVariable String courseSlug, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("isEnrolled", false));
        }
        String email = authentication.getName();
        boolean isEnrolled = enrollmentService.isEnrolled(email, courseSlug);
        return ResponseEntity.ok(Map.of("isEnrolled", isEnrolled));
    }
}
