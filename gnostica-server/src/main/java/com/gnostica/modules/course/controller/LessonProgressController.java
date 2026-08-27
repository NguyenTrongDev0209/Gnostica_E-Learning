package com.gnostica.modules.course.controller;


import com.gnostica.modules.forum.dto.request.*;
import com.gnostica.modules.checkout.dto.request.*;
import com.gnostica.modules.checkout.dto.request.*;

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
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;
    private final com.gnostica.modules.course.service.QuizResultService quizResultService; // Inject Quiz service

    @GetMapping("/course/{slug}")
    public ResponseEntity<?> getCourseProgress(
            @PathVariable String slug,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem tiáº¿n Ä‘á»™ há»c táº­p"));
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
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ lÆ°u tiáº¿n Ä‘á»™ há»c táº­p"));
        }
        String email = authentication.getName();
        try {
            lessonProgressService.updateLastWatchedTime(lessonId, email, time);
            return ResponseEntity.ok(Map.of("message", "ÄÃ£ cáº­p nháº­t thá»i gian xem"));
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
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ lÆ°u tiáº¿n Ä‘á»™ há»c táº­p"));
        }
        String email = authentication.getName();
        try {
            lessonProgressService.markLessonAsCompleted(lessonId, email);
            return ResponseEntity.ok(Map.of("message", "ÄÃ£ Ä‘Ã¡nh dáº¥u hoÃ n thÃ nh bÃ i há»c"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // â”€â”€ Endpoint Má»›i: Submit & Reset Quiz Results â”€â”€
    @PostMapping("/quiz/{quizId}/submit")
    public ResponseEntity<?> submitQuizResult(
            @PathVariable Integer quizId,
            @RequestBody com.gnostica.modules.course.dto.request.QuizSubmitRequest req,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ lÆ°u Ä‘iá»ƒm bÃ i táº­p"));
        }
        String email = authentication.getName();
        try {
            quizResultService.submitQuizResult(quizId, email, req);
            return ResponseEntity.ok(Map.of("message", "ÄÃ£ lÆ°u káº¿t quáº£ bÃ i táº­p"));
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
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n"));
        }
        String email = authentication.getName();
        try {
            quizResultService.resetQuizResult(quizId, email);
            return ResponseEntity.ok(Map.of("message", "ÄÃ£ Ä‘áº·t láº¡i bÃ i táº­p (cho phÃ©p lÃ m láº¡i)"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

