package com.gnostica.controller;

import com.gnostica.model.Course;
import com.gnostica.service.CourseService;
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

    /**
     * Endpoint Lấy danh sách khóa học theo trạng thái (Pending, Approved, Rejected) dành cho Admin
     */
    @GetMapping("/moderation")
    public ResponseEntity<Page<Course>> getModerationCourses(
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
    public ResponseEntity<Course> getCourseForModeration(@PathVariable String slug) {
        return ResponseEntity.ok(courseService.getCourseForModerationBySlug(slug));
    }

    /**
     * Endpoint Phê duyệt khóa học công khai lên hệ thống thông qua Slug
     */
    @PostMapping("/{slug}/approve")
    public ResponseEntity<Map<String, Object>> approveCourse(@PathVariable String slug) {
        try {
            Course approved = courseService.approveCourseBySlug(slug);
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
            Course rejected = courseService.rejectCourseBySlug(slug, rejectReason);
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
}
