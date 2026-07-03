package com.gnostica.modules.user.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.dto.response.EnrollmentDTO;
import com.gnostica.modules.user.dto.response.InstructorStudentDTO;
import com.gnostica.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructor/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstructorStudentController {

    private final EnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<?> getMyStudents(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để xem danh sách học viên"));
        }

        String email = authentication.getName();
        List<InstructorStudentDTO> students = enrollmentService.getInstructorStudents(email);

        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/{studentId}/courses")
    public ResponseEntity<?> getStudentCourses(@PathVariable Integer studentId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập"));
        }

        String instructorEmail = authentication.getName();
        List<EnrollmentDTO> courses = enrollmentService.getStudentEnrollmentsForInstructor(studentId, instructorEmail);

        return ResponseEntity.ok(ApiResponse.success(courses));
    }
}
