package com.gnostica.modules.user.controller;

import com.gnostica.modules.user.dto.response.InstructorStatsResponse;
import com.gnostica.modules.course.dto.response.CourseResponse;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.ReviewRepository;
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
public class InstructorProfileController {

    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final ReviewRepository reviewRepository;
    private final AuthService authService;
    private final CourseService courseService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    /**
     * Láº¥y danh sÃ¡ch táº¥t cáº£ giáº£ng viÃªn kÃ¨m theo thá»‘ng kÃª
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
                    .id(account.getId()) // Sá»­ dá»¥ng Account ID cho cÃ¡c liÃªn káº¿t URL
                    .fullName(account.getFullName())
                    .email(account.getEmail())
                    .avatar(account.getAvatar())
                    .coursesCount(coursesCount)
                    .studentsCount(studentsCount)
                    .rating(4.8)
                    .title(title.isEmpty() ? "Giáº£ng viÃªn" : title)
                    .bio(bio)
                    .categories(categories)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Láº¥y thÃ´ng tin há»“ sÆ¡ cÃ´ng khai cá»§a giáº£ng viÃªn theo ID
     */
    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getInstructorProfile(@PathVariable java.util.UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y giáº£ng viÃªn"));

        // Đếm số khóa học đang hoạt động của giảng viên
        long coursesCount = courseRepository.countByAccountIdAndStatus(id, 1);

        // Đếm tổng số học viên đã đăng ký các khóa học của giảng viên
        long studentsCount = courseRepository.countStudentsByInstructorId(id);

        // Lấy điểm đánh giá trung bình và tổng số đánh giá
        Double averageRating = reviewRepository.getAverageRatingByInstructorId(id);
        long reviewsCount = reviewRepository.countByCourseAccountIdAndDeletedAtIsNullAndStatusAndParentIsNull(id, 1);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", account.getId());
        profile.put("name", account.getFullName());
        profile.put("avatar", account.getAvatar());
        profile.put("email", account.getEmail());
        profile.put("role", account.getRole() != null ? account.getRole().getName() : null);
        profile.put("coursesCount", coursesCount);
        profile.put("studentsCount", studentsCount);
        profile.put("rating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);
        profile.put("reviewsCount", reviewsCount);
        profile.put("joinedAt", account.getCreatedAt());

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
     * Láº¥y cÃ¡c khÃ³a há»c Ä‘ang hoáº¡t Ä‘á»™ng cá»§a giáº£ng viÃªn
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
