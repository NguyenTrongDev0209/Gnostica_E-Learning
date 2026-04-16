package com.gnostica.controller;

import com.gnostica.model.Account;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstructorProfileController {

    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;

    /**
     * Lấy thông tin hồ sơ công khai của giảng viên theo ID
     */
    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getInstructorProfile(@PathVariable Integer id) {
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
        profile.put("coursesCount", coursesCount);
        profile.put("studentsCount", studentsCount);
        profile.put("reviewsCount", 0); // Chưa có hệ thống đánh giá

        return ResponseEntity.ok(profile);
    }

    /**
     * Lấy các khóa học đang hoạt động của giảng viên
     */
    @GetMapping("/{id}/courses")
    public ResponseEntity<?> getInstructorCourses(@PathVariable Integer id) {
        return ResponseEntity.ok(courseRepository.findByAccountIdAndStatus(id, 1));
    }
}
