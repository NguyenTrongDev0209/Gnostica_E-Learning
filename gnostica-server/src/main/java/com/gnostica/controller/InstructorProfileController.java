package com.gnostica.controller;

import com.gnostica.dto.response.InstructorStatsResponse;
import com.gnostica.dto.response.CourseResponse;
import com.gnostica.model.Account;
import com.gnostica.model.Instructor;
import com.gnostica.model.Course;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.repository.InstructorRepository;
import com.gnostica.service.AuthService;
import com.gnostica.service.CourseService;
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
    private final InstructorRepository instructorRepository;
    private final AuthService authService;
    private final CourseService courseService;

    /**
     * Lấy danh sách tất cả giảng viên kèm theo thống kê
     */
    @GetMapping("/list")
    public ResponseEntity<?> getAllInstructorsWithStats() {
        List<Instructor> instructors = instructorRepository.findAll();
        List<InstructorStatsResponse> response = instructors.stream().map(instructor -> {
            Account account = instructor.getAccount();
            long coursesCount = courseRepository.countByAccountIdAndStatus(account.getId(), 1);
            long studentsCount = courseRepository.countStudentsByInstructorId(account.getId());
            
            return InstructorStatsResponse.builder()
                    .id(account.getId()) // Sử dụng Account ID cho các liên kết URL
                    .fullName(instructor.getFullName())
                    .email(instructor.getEmail())
                    .avatar(account.getAvatar())
                    .coursesCount(coursesCount)
                    .studentsCount(studentsCount)
                    .rating(4.8)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

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
        List<Course> courses = courseRepository.findByAccountIdAndStatus(id, 1);
        List<CourseResponse> dtos = courses.stream()
                .map(courseService::mapToCourseResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
