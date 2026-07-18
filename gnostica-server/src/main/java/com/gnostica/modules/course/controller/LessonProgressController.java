package com.gnostica.modules.course.controller;


import com.gnostica.modules.forum.dto.request.*;
import com.gnostica.modules.order.dto.request.*;
import com.gnostica.modules.payment.dto.request.*;

import com.gnostica.modules.course.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;
    private final com.gnostica.modules.course.service.QuizResultService quizResultService; // Inject Quiz service

    @GetMapping("/course/{slug}")
    public ResponseEntity<?> getCourseProgress(
            @PathVariable String slug,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để xem tiến độ học tập"));
        }
        String email = authentication.getName();
        return ResponseEntity.ok(lessonProgressService.getCourseProgressBySlug(slug, email));
    }

    @PostMapping("/lesson/{lessonId}/time")
    public ResponseEntity<?> updateLastWatchedTime(
            @PathVariable Integer lessonId,
            @RequestParam String time,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để lưu tiến độ học tập"));
        }
        String email = authentication.getName();
        try {
            lessonProgressService.updateLastWatchedTime(lessonId, email, time);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật thời gian xem"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/lesson/{lessonId}/complete")
    public ResponseEntity<?> markLessonAsCompleted(
            @PathVariable Integer lessonId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để lưu tiến độ học tập"));
        }
        String email = authentication.getName();
        try {
            lessonProgressService.markLessonAsCompleted(lessonId, email);
            return ResponseEntity.ok(Map.of("message", "Đã đánh dấu hoàn thành bài học"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Endpoint Mới: Submit & Reset Quiz Results ──
    @PostMapping("/quiz/{quizId}/submit")
    public ResponseEntity<?> submitQuizResult(
            @PathVariable Integer quizId,
            @RequestBody com.gnostica.modules.course.dto.request.QuizSubmitRequest req,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để lưu điểm bài tập"));
        }
        String email = authentication.getName();
        try {
            quizResultService.submitQuizResult(quizId, email, req);
            return ResponseEntity.ok(Map.of("message", "Đã lưu kết quả bài tập"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/quiz/{quizId}/reset")
    public ResponseEntity<?> resetQuizResult(
            @PathVariable Integer quizId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập để thực hiện"));
        }
        String email = authentication.getName();
        try {
            quizResultService.resetQuizResult(quizId, email);
            return ResponseEntity.ok(Map.of("message", "Đã đặt lại bài tập (cho phép làm lại)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
