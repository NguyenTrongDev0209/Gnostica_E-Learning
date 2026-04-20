package com.gnostica.service;

import com.gnostica.dto.response.EnrollmentDTO;
import com.gnostica.model.Account;
import com.gnostica.model.Course;
import com.gnostica.model.Enrollment;
import com.gnostica.model.Lesson;
import com.gnostica.model.Module;
import com.gnostica.model.LessonProgress;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.EnrollmentRepository;
import com.gnostica.repository.LessonProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final AccountRepository accountRepository;
    private final LessonProgressRepository lessonProgressRepository;

    @Transactional(readOnly = true)
    public List<EnrollmentDTO> getMyCourses(String email) {
        System.out.println(">>> DEBUG [getMyCourses] Fetching courses for email: " + email);
        
        Account account = accountRepository.findByEmail(email.toLowerCase().trim())
                .orElseGet(() -> accountRepository.findByEmail(email).orElse(null));

        if (account == null) {
            System.out.println(">>> DEBUG [getMyCourses] Account not found for email: " + email);
            throw new RuntimeException("Tài khoản không tồn tại");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByAccount(account);
        System.out.println(">>> DEBUG [getMyCourses] Found " + enrollments.size() + " total enrollments for account.");

        List<LessonProgress> allProgress = lessonProgressRepository.findByAccount(account);

        Map<Integer, List<LessonProgress>> progressByCourse = allProgress.stream()
                .filter(lp -> lp != null && lp.getLesson() != null && 
                             lp.getLesson().getModule() != null && 
                             lp.getLesson().getModule().getCourse() != null)
                .collect(Collectors.groupingBy(lp -> lp.getLesson().getModule().getCourse().getId()));

        return enrollments.stream()
                .peek(e -> System.out.println(">>> DEBUG [getMyCourses] Evaluating Enrollment ID: " + e.getId() + ", Status: " + e.getStatus()))
                .filter(e -> e.getStatus() == null || Objects.equals(e.getStatus(), 1)) 
                .map(e -> {
                    List<LessonProgress> courseProgress = progressByCourse.getOrDefault(
                            e.getCourse().getId(), Collections.emptyList());
                    return convertToDTO(e, courseProgress);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private EnrollmentDTO convertToDTO(Enrollment enrollment, List<LessonProgress> courseProgress) {
        Course course = enrollment.getCourse();
        if (course == null) return null;

        // Tìm bài học cuối cùng đang học
        String lastLessonIdStr = courseProgress.stream()
                .filter(lp -> lp != null && lp.getLesson() != null)
                .sorted((lp1, lp2) -> {
                    LocalDateTime t1 = lp1.getUpdatedAt() != null ? lp1.getUpdatedAt() : lp1.getCompletedAt();
                    LocalDateTime t2 = lp2.getUpdatedAt() != null ? lp2.getUpdatedAt() : lp2.getCompletedAt();
                    if (t1 == null && t2 == null) return 0;
                    if (t1 == null) return 1;
                    if (t2 == null) return -1;
                    return t2.compareTo(t1);
                })
                .map(lp -> lp.getLesson().getId().toString()) // Sử dụng ID thay vì Slug theo yêu cầu
                .findFirst()
                .orElse(null);

        // Tìm bài học đầu tiên (cho nút "Ôn tập" hoặc "Bắt đầu học")
        String firstLessonIdStr = course.getModules().stream()
                .filter(m -> m.getStatus() != null && (m.getStatus() == 1 || m.getStatus() == 2))
                .flatMap(m -> m.getLessons().stream())
                .filter(l -> l.getStatus() != null && (l.getStatus() == 1 || l.getStatus() == 2))
                .map(l -> l.getId().toString())
                .findFirst()
                .orElse(null);

        return EnrollmentDTO.builder()
                .id(enrollment.getId())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .courseSlug(course.getSlug())
                .courseThumbnail(course.getThumbnail())
                .instructorName(course.getAccount() != null ? course.getAccount().getFullName() : "Unknown")
                .progressPercent(enrollment.getProgressPercent() != null ? enrollment.getProgressPercent() : 0)
                .completedAt(enrollment.getCompletedAt())
                .joinedAt(enrollment.getCreatedAt())
                .lastWatchedLessonSlug(lastLessonIdStr) 
                .firstLessonId(firstLessonIdStr)
                .build();
    }

    @Transactional
    public void updateProgress(Integer accountId, Integer courseId) {
        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null) return;

        Enrollment enrollment = enrollmentRepository.findByAccount(account).stream()
                .filter(e -> e.getCourse() != null && Objects.equals(e.getCourse().getId(), courseId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        Course course = enrollment.getCourse();
        long totalLessons = course.getModules().stream()
                .flatMap(m -> m.getLessons().stream())
                .filter(l -> l.getStatus() != null && (l.getStatus() == 1 || l.getStatus() == 2))
                .count();

        if (totalLessons == 0) return;

        long completedLessons = lessonProgressRepository.findByAccount(account).stream()
                .filter(lp -> lp != null && lp.getIsCompleted() &&
                        lp.getLesson() != null &&
                        lp.getLesson().getModule() != null &&
                        lp.getLesson().getModule().getCourse() != null &&
                        Objects.equals(lp.getLesson().getModule().getCourse().getId(), courseId))
                .count();

        int progressPercent = (int) ((completedLessons * 100) / totalLessons);
        enrollment.setProgressPercent(progressPercent);
        if (progressPercent == 100 && enrollment.getCompletedAt() == null) {
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(String email, String courseSlug) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim())
                .orElseGet(() -> accountRepository.findByEmail(email).orElse(null));
        if (account == null) return false;
        
        return enrollmentRepository.findByAccount(account).stream()
                .anyMatch(e -> e.getCourse() != null &&
                        Objects.equals(e.getCourse().getSlug(), courseSlug) &&
                        (e.getStatus() == null || Objects.equals(e.getStatus(), 1)));
    }
}
