package com.gnostica.modules.user.controller;

import com.gnostica.modules.user.dto.response.InstructorStatsResponse;
import com.gnostica.modules.course.dto.response.CourseResponse;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.modules.auth.service.AuthService;
import com.gnostica.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstructorProfileController {

    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final AuthService authService;
    private final CourseService courseService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    /**
     * Lấy danh sách tất cả giảng viên kèm theo thống kê
     */
    @GetMapping("/list")
    public ResponseEntity<?> getAllInstructorsWithStats() {
        List<Account> instructors = accountRepository.findByRoleName("INSTRUCTOR");
        List<InstructorStatsResponse> response = instructors.stream().map(account -> {
            List<Course> instructorCourses = courseRepository.findByAccountIdAndStatus(account.getId(), 1);
            long coursesCount = instructorCourses.size();
            long studentsCount = courseRepository.countStudentsByInstructorId(account.getId());
            
            List<String> categories = instructorCourses.stream()
                .filter(c -> c.getCategory() != null)
                .map(c -> c.getCategory().getName())
                .distinct()
                .collect(Collectors.toList());
            
            String title = "";
            String bio = "";
            try {
                if (account.getMetadata() != null && !account.getMetadata().isEmpty()) {
                    com.fasterxml.jackson.databind.JsonNode metadataNode = objectMapper.readTree(account.getMetadata());
                    if (metadataNode.has("title")) title = metadataNode.get("title").asText();
                    if (metadataNode.has("bio")) bio = metadataNode.get("bio").asText();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            return InstructorStatsResponse.builder()
                    .id(account.getId()) // Sử dụng Account ID cho các liên kết URL
                    .fullName(account.getFullName())
                    .email(account.getEmail())
                    .avatar(account.getAvatar())
                    .coursesCount(coursesCount)
                    .studentsCount(studentsCount)
                    .rating(4.8)
                    .title(title.isEmpty() ? "Giảng viên" : title)
                    .bio(bio)
                    .categories(categories)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Lấy thông tin hồ sơ công khai của giảng viên theo ID
     */
    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getInstructorProfile(@PathVariable java.util.UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));

        // Đếm số khóa học đang hoạt động của giảng viên
        long coursesCount = courseRepository.countByAccountIdAndStatus(id, 1);

        // Đếm tổng số học viên đã đăng ký các khóa học của giảng viên
        long studentsCount = courseRepository.countStudentsByInstructorId(id);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", account.getId());
        profile.put("name", account.getFullName());
        profile.put("avatar", account.getAvatar());
        profile.put("email", account.getEmail());
        profile.put("role", account.getRole() != null ? account.getRole().getName() : null);
        profile.put("coursesCount", coursesCount);
        profile.put("studentsCount", studentsCount);
        profile.put("reviewsCount", 0); // Chưa có hệ thống đánh giá

        String bio = "";
        String title = "";
        String website = "";
        String linkedin = "";
        boolean ticked = false;
        try {
            if (account.getMetadata() != null && !account.getMetadata().isEmpty()) {
                com.fasterxml.jackson.databind.JsonNode metadataNode = objectMapper.readTree(account.getMetadata());
                if (metadataNode.has("bio")) bio = metadataNode.get("bio").asText();
                if (metadataNode.has("title")) title = metadataNode.get("title").asText();
                if (metadataNode.has("website")) website = metadataNode.get("website").asText();
                if (metadataNode.has("linkedin")) linkedin = metadataNode.get("linkedin").asText();
                if (metadataNode.has("ticked")) ticked = metadataNode.get("ticked").asBoolean();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        profile.put("bio", bio);
        profile.put("title", title);
        profile.put("website", website);
        profile.put("linkedin", linkedin);
        profile.put("ticked", ticked);
        profile.put("phone", account.getPhone());

        return ResponseEntity.ok(profile);
    }

    /**
     * Lấy các khóa học đang hoạt động của giảng viên
     */
    @GetMapping("/{id}/courses")
    public ResponseEntity<?> getInstructorCourses(@PathVariable java.util.UUID id) {
        List<Course> courses = courseRepository.findByAccountIdAndStatus(id, 1);
        List<CourseResponse> dtos = courses.stream()
                .map(courseService::mapToCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
