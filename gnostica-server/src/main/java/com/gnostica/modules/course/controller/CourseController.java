package com.gnostica.modules.course.controller;

import com.gnostica.modules.course.dto.request.CourseRequest;
import com.gnostica.core.exception.ResourceNotFoundException;
import com.gnostica.modules.forum.dto.response.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.modules.dashboard.dto.response.*;
import com.gnostica.modules.checkout.dto.response.*;
import com.gnostica.modules.checkout.dto.response.*;
import com.gnostica.modules.course.dto.response.*;
import com.gnostica.core.model.Course;
import com.gnostica.modules.course.service.CourseService;
import com.gnostica.modules.course.service.LessonPlaybackService;
import com.gnostica.modules.integration.service.BunnyTranscriptionService;
import com.gnostica.modules.integration.service.AiModerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final BunnyTranscriptionService bunnyTranscriptionService;
    private final AiModerationService aiModerationService;
    private final LessonPlaybackService lessonPlaybackService;
    
    @GetMapping
    public ResponseEntity<?> getPublicCourses(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) List<String> categorySlug,
            @RequestParam(required = false) List<String> level,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return ResponseEntity.ok(courseService.getPublicCourses(
                categoryId, categorySlug, level, minPrice, maxPrice, search, page, Math.min(size, 20)));
    }

    @GetMapping("/public-levels")
    public ResponseEntity<java.util.List<String>> getPublicLevels() {
        return ResponseEntity.ok(courseService.getPublicLevels());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCourse(
            @Valid @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        // Find email from Principal/JWT token
        String email = authentication.getName(); 
        
        try {
            Course savedCourse = courseService.createCourse(request, email);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "ThÃªm khÃ³a há»c thÃ nh cÃ´ng");
            response.put("courseId", savedCourse.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lá»—i táº¡o khÃ³a há»c: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/{slug}")
    public ResponseEntity<?> getCourseDetail(
            @PathVariable String slug,
            Authentication authentication
    ) {
        try {
            String email = authentication != null ? authentication.getName() : null;
            return ResponseEntity.ok(courseService.getCourseBySlug(slug, email));
        } catch (ResourceNotFoundException exception) {
            // Do not disclose whether a supplied slug belongs to a hidden,
            // deleted, or simply nonexistent course.
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Returns a (short-lived, signed) embed URL for the course promo/trailer.
     * Public like the course detail page: the signed token only authorises
     * playback of the promo video, never the underlying secret.
     */
    @GetMapping("/{slug}/promo-playback")
    public ResponseEntity<?> getPromoPlayback(@PathVariable String slug) {
        try {
            CourseDetailResponse detail = courseService.getCourseBySlug(slug, null);
            if (detail == null || detail.getPromoVideo() == null || detail.getPromoVideo().isBlank()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(lessonPlaybackService.resolveSignedEmbed(detail.getPromoVideo()));
        } catch (ResourceNotFoundException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{slug}")
    public ResponseEntity<?> updateCourse(
            @PathVariable String slug,
            @Valid @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        try {
            CourseDetailResponse updatedCourse = courseService.updateCourseBySlug(slug, request, email);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lá»—i cáº­p nháº­t khÃ³a há»c: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable java.util.UUID id, Authentication authentication) {
        String email = authentication.getName();
        try {
            courseService.deleteCourse(id, email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "XÃ³a khÃ³a há»c thÃ nh cÃ´ng");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lá»—i xÃ³a khÃ³a há»c: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/instructor")
    public ResponseEntity<?> getInstructorCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(courseService.getInstructorCourses(email, search, categoryId, status, page, size));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateCourseStatus(
            @PathVariable java.util.UUID id,
            @RequestBody Map<String, Integer> statusUpdate,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Integer newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lÃ²ng cung cáº¥p tráº¡ng thÃ¡i má»›i"));
        }
        try {
            CourseDetailResponse updated = courseService.patchCourseStatus(id, newStatus, email);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    @PostMapping("/ai-pre-scan-text")
    public ResponseEntity<String> preScanText(@RequestBody Map<String, String> body) {
        String title = body.get("title");
        String description = body.get("description");
        
        String resultJson = aiModerationService.preScanCourseText(title, description);
        return ResponseEntity.ok(resultJson);
    }

    @PostMapping("/ai-pre-scan-video")
    public ResponseEntity<String> preScanVideo(@RequestBody Map<String, String> body) {
        String videoUrl = body.get("videoUrl");
        String resultJson = aiModerationService.preScanVideoContent(videoUrl);
        return ResponseEntity.ok(resultJson);
    }

    @PostMapping("/get-video-transcript")
    public ResponseEntity<Map<String, String>> getVideoTranscript(@RequestBody Map<String, String> body) {
        String videoUrl = body.get("videoUrl");
        String transcript = aiModerationService.getVideoTranscriptText(videoUrl);
        
        Map<String, String> response = new HashMap<>();
        response.put("transcript", transcript);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendedCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ nháº­n gá»£i Ã½"));
        }
        String email = authentication.getName();
        return ResponseEntity.ok(courseService.getRecommendedCourses(email, page, size));
    }
}

