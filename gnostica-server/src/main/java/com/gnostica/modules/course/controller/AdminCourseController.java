package com.gnostica.modules.course.controller;

import com.gnostica.modules.forum.dto.response.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.modules.dashboard.dto.response.*;
import com.gnostica.modules.checkout.dto.response.*;
import com.gnostica.modules.checkout.dto.response.*;
import com.gnostica.modules.course.dto.response.*;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Lesson;
import com.gnostica.modules.course.service.CourseService;
import com.gnostica.modules.course.service.LessonPlaybackService;
import com.gnostica.modules.integration.service.AiModerationService;
import com.gnostica.core.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;
    private final AiModerationService aiModerationService;
    private final LessonRepository lessonRepository;
    private final LessonPlaybackService lessonPlaybackService;

    /**
     * Endpoint Láº¥y danh sÃ¡ch khÃ³a há»c theo tráº¡ng thÃ¡i (Pending, Approved, Rejected) dÃ nh cho Admin
     */
    @GetMapping("/moderation")
    public ResponseEntity<Page<CourseResponse>> getModerationCourses(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(courseService.getModerationCourses(status, search, categoryId, page, size));
    }

    /**
     * Endpoint Láº¥y thá»‘ng kÃª sá»‘ lÆ°á»£ng khÃ³a há»c theo tá»«ng tráº¡ng thÃ¡i kiá»ƒm duyá»‡t
     */
    @GetMapping("/moderation/stats")
    public ResponseEntity<Map<String, Long>> getModerationStats() {
        return ResponseEntity.ok(courseService.getModerationStats());
    }

    /**
     * Tráº£ vá» embed URL (Ä‘Ã£ kÃ½, háº¿t háº¡n ngáº¯n) cho má»™t video báº¥t ká»³ Ä‘á»ƒ Admin
     * xem trÆ°á»›c ná»™i dung khÃ³a há»c Ä‘ang kiá»ƒm duyá»‡t. Token chá»‰ xÃ¡c thá»±c playback
     * cá»§a video cá»¥ thá»ƒ, khÃ´ng lá»™ bÃ­ máº­t.
     */
    @PostMapping("/signed-embed")
    public ResponseEntity<?> getSignedEmbed(@RequestBody Map<String, String> body) {
        String videoUrl = body.get("videoUrl");
        if (videoUrl == null || videoUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "videoUrl is required"));
        }
        try {
            return ResponseEntity.ok(lessonPlaybackService.resolveSignedEmbed(videoUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Endpoint Xem chi tiáº¿t khÃ³a há»c Ä‘á»ƒ kiá»ƒm duyá»‡t thÃ´ng qua Slug
     */
    @GetMapping("/{slug}")
    public ResponseEntity<CourseDetailResponse> getCourseForModeration(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseForModerationBySlug(slug));
    }

    /**
     * Endpoint PhÃª duyá»‡t khÃ³a há»c cÃ´ng khai lÃªn há»‡ thá»‘ng thÃ´ng qua Slug
     */
    @PostMapping("/{slug}/approve")
    public ResponseEntity<Map<String, Object>> approveCourse(@PathVariable String slug) {
        try {
            CourseDetailResponse approved = courseService.approveCourseBySlug(slug);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "PhÃª duyá»‡t vÃ  cÃ´ng khai khÃ³a há»c thÃ nh cÃ´ng!");
            response.put("slug", approved.getSlug());
            response.put("status", approved.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lá»—i phÃª duyá»‡t: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Tá»« chá»‘i phÃª duyá»‡t khÃ³a há»c vÃ  gá»­i lÃ½ do pháº£n há»“i thÃ´ng qua Slug
     */
    @PostMapping("/{slug}/reject")
    public ResponseEntity<Map<String, Object>> rejectCourse(
            @PathVariable String slug,
            @RequestBody Map<String, String> requestBody
    ) {
        try {
            String rejectReason = requestBody.get("rejectReason");
            CourseDetailResponse rejected = courseService.rejectCourseBySlug(slug, rejectReason);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "ÄÃ£ tá»« chá»‘i phÃª duyá»‡t khÃ³a há»c thÃ nh cÃ´ng!");
            response.put("slug", rejected.getSlug());
            response.put("status", rejected.getStatus());
            response.put("rejectReason", rejected.getRejectReason());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lá»—i tá»« chá»‘i duyá»‡t: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Cho phÃ©p Admin kÃ­ch hoáº¡t cháº¡y quÃ©t/phÃ¢n tÃ­ch láº¡i báº±ng AI cho má»™t bÃ i há»c cá»¥ thá»ƒ
     */
    @PostMapping("/lessons/{lessonId}/ai-scan")
    public ResponseEntity<Map<String, Object>> scanLesson(@PathVariable Integer lessonId) {
        try {
            Lesson lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y bÃ i há»c yÃªu cáº§u."));
            
            Lesson scanned = aiModerationService.scanLesson(lesson);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "QuÃ©t kiá»ƒm duyá»‡t AI thÃ nh cÃ´ng!");
            response.put("lessonId", scanned.getId());
            response.put("aiModerationReport", "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lá»—i khi gá»i AI quÃ©t bÃ i há»c: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Cho phÃ©p Admin kÃ­ch hoáº¡t cháº¡y quÃ©t láº¡i báº±ng AI cho thÃ´ng tin vÄƒn báº£n chung cá»§a khÃ³a há»c
     */
    @PostMapping("/{slug}/ai-scan-info")
    public ResponseEntity<Map<String, Object>> scanCourseInfo(@PathVariable String slug) {
        try {
            Course course = courseService.getCourseEntityForModerationBySlug(slug);
            Course scanned = aiModerationService.scanCourseInfo(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "QuÃ©t AI vÄƒn báº£n khÃ³a há»c thÃ nh cÃ´ng!");
            response.put("slug", scanned.getSlug());
            response.put("aiModerationReport", "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lá»—i khi gá»i AI quÃ©t khÃ³a há»c: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Cho phÃ©p Admin kÃ­ch hoáº¡t cháº¡y quÃ©t AI TOÃ€N DIá»†N cho khÃ³a há»c (bao gá»“m ná»™i dung bÃ i há»c, tráº¯c nghiá»‡m, lá»i thoáº¡i)
     */
    @PostMapping("/{slug}/ai-scan-full")
    public ResponseEntity<Map<String, Object>> scanCourseFull(@PathVariable String slug) {
        try {
            Course course = courseService.getCourseEntityForModerationBySlug(slug);
            // Hiá»‡n táº¡i scanCourseInfo Ä‘Ã£ Ä‘Æ°á»£c nÃ¢ng cáº¥p Ä‘á»ƒ quÃ©t toÃ n bá»™ dá»¯ liá»‡u aggregated
            Course scanned = aiModerationService.scanCourseInfo(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Kiá»ƒm duyá»‡t AI toÃ n diá»‡n hoÃ n táº¥t!");
            response.put("slug", scanned.getSlug());
            response.put("aiModerationReport", "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lá»—i khi gá»i AI quÃ©t toÃ n diá»‡n: " + e.getMessage()));
        }
    }
}

