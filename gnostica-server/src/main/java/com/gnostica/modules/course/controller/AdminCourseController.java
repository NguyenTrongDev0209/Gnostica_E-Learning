package com.gnostica.modules.course.controller;

import com.gnostica.modules.forum.dto.response.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.modules.dashboard.dto.response.*;
import com.gnostica.modules.order.dto.response.*;
import com.gnostica.modules.payment.dto.response.*;
import com.gnostica.modules.course.dto.response.*;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Lesson;
import com.gnostica.modules.course.service.CourseService;
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
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;
    private final AiModerationService aiModerationService;
    private final LessonRepository lessonRepository;

    /**
     * Endpoint Lấy danh sách khóa học theo trạng thái (Pending, Approved, Rejected) dành cho Admin
     */
    @GetMapping("/moderation")
    public ResponseEntity<Page<CourseResponse>> getModerationCourses(
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(courseService.getModerationCourses(status, page, size));
    }

    /**
     * Endpoint Lấy thống kê số lượng khóa học theo từng trạng thái kiểm duyệt
     */
    @GetMapping("/moderation/stats")
    public ResponseEntity<Map<String, Long>> getModerationStats() {
        return ResponseEntity.ok(courseService.getModerationStats());
    }

    /**
     * Endpoint Xem chi tiết khóa học để kiểm duyệt thông qua Slug
     */
    @GetMapping("/{slug}")
    public ResponseEntity<CourseDetailResponse> getCourseForModeration(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseForModerationBySlug(slug));
    }

    /**
     * Endpoint Phê duyệt khóa học công khai lên hệ thống thông qua Slug
     */
    @PostMapping("/{slug}/approve")
    public ResponseEntity<Map<String, Object>> approveCourse(@PathVariable String slug) {
        try {
            CourseDetailResponse approved = courseService.approveCourseBySlug(slug);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Phê duyệt và công khai khóa học thành công!");
            response.put("slug", approved.getSlug());
            response.put("status", approved.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi phê duyệt: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Từ chối phê duyệt khóa học và gửi lý do phản hồi thông qua Slug
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
            response.put("message", "Đã từ chối phê duyệt khóa học thành công!");
            response.put("slug", rejected.getSlug());
            response.put("status", rejected.getStatus());
            response.put("rejectReason", rejected.getRejectReason());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi từ chối duyệt: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Cho phép Admin kích hoạt chạy quét/phân tích lại bằng AI cho một bài học cụ thể
     */
    @PostMapping("/lessons/{lessonId}/ai-scan")
    public ResponseEntity<Map<String, Object>> scanLesson(@PathVariable Integer lessonId) {
        try {
            Lesson lesson = lessonRepository.findById(lessonId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học yêu cầu."));
            
            Lesson scanned = aiModerationService.scanLesson(lesson);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Quét kiểm duyệt AI thành công!");
            response.put("lessonId", scanned.getId());
            response.put("aiModerationReport", scanned.getAiModerationReport());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi gọi AI quét bài học: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Cho phép Admin kích hoạt chạy quét lại bằng AI cho thông tin văn bản chung của khóa học
     */
    @PostMapping("/{slug}/ai-scan-info")
    public ResponseEntity<Map<String, Object>> scanCourseInfo(@PathVariable String slug) {
        try {
            Course course = courseService.getCourseEntityForModerationBySlug(slug);
            Course scanned = aiModerationService.scanCourseInfo(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Quét AI văn bản khóa học thành công!");
            response.put("slug", scanned.getSlug());
            response.put("aiModerationReport", scanned.getAiModerationReport());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi gọi AI quét khóa học: " + e.getMessage()));
        }
    }

    /**
     * Endpoint Cho phép Admin kích hoạt chạy quét AI TOÀN DIỆN cho khóa học (bao gồm nội dung bài học, trắc nghiệm, lời thoại)
     */
    @PostMapping("/{slug}/ai-scan-full")
    public ResponseEntity<Map<String, Object>> scanCourseFull(@PathVariable String slug) {
        try {
            Course course = courseService.getCourseEntityForModerationBySlug(slug);
            // Hiện tại scanCourseInfo đã được nâng cấp để quét toàn bộ dữ liệu aggregated
            Course scanned = aiModerationService.scanCourseInfo(course);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Kiểm duyệt AI toàn diện hoàn tất!");
            response.put("slug", scanned.getSlug());
            response.put("aiModerationReport", scanned.getAiModerationReport());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi gọi AI quét toàn diện: " + e.getMessage()));
        }
    }
}
