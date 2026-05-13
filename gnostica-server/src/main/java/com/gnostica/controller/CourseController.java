package com.gnostica.controller;

import com.gnostica.dto.request.CourseRequest;
import com.gnostica.model.Course;
import com.gnostica.service.CourseService;
import com.gnostica.service.BunnyTranscriptionService;
import com.gnostica.service.AiModerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust based on your env
public class CourseController {

    private final CourseService courseService;
    private final BunnyTranscriptionService bunnyTranscriptionService;
    private final AiModerationService aiModerationService;
    
    @GetMapping
    public ResponseEntity<?> getPublicCourses(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return ResponseEntity.ok(courseService.getPublicCourses(categoryId, categorySlug, level, page, size));
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
            response.put("message", "Thêm khóa học thành công");
            response.put("courseId", savedCourse.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi tạo khóa học: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    @GetMapping("/{slug}")
    public ResponseEntity<Course> getCourseDetail(
            @PathVariable String slug,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(courseService.getCourseBySlug(slug, email));
    }

    @PutMapping("/{slug}")
    public ResponseEntity<?> updateCourse(
            @PathVariable String slug,
            @Valid @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        try {
            Course updatedCourse = courseService.updateCourseBySlug(slug, request, email);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi cập nhật khóa học: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        try {
            courseService.deleteCourse(id, email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa khóa học thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi xóa khóa học: " + e.getMessage());
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
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> statusUpdate,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Integer newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng cung cấp trạng thái mới"));
        }
        try {
            Course updated = courseService.patchCourseStatus(id, newStatus, email);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/lessons/check-subtitle/{videoId}")
    public ResponseEntity<Map<String, Object>> checkSubtitleStatus(@PathVariable String videoId) {
        String subtitle = bunnyTranscriptionService.fetchSubtitleVtt(videoId);
        Map<String, Object> response = new HashMap<>();
        response.put("ready", subtitle != null);
        return ResponseEntity.ok(response);
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
}
