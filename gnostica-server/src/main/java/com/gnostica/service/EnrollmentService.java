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
    private final com.gnostica.repository.QuizResultRepository quizResultRepository; // Inject Quiz Repo
    private final MailService mailService;

    @Transactional
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

    @Transactional(readOnly = true)
    public com.gnostica.dto.response.StudentStatsResponse getStudentStats(String email) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim())
                .orElseGet(() -> accountRepository.findByEmail(email).orElse(null));

        if (account == null) {
            throw new RuntimeException("Tài khoản không tồn tại");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByAccount(account);
        
        long enrolledCourses = enrollments.stream()
                .filter(e -> e.getStatus() == null || Objects.equals(e.getStatus(), 1))
                .count();
                
        long completedCourses = enrollments.stream()
                .filter(e -> e.getStatus() == null || Objects.equals(e.getStatus(), 1))
                .filter(e -> e.getProgressPercent() != null && e.getProgressPercent() == 100)
                .count();

        // Tính số giờ đã học dựa trên số bài học đã hoàn thành
        // Tạm thời giả định mỗi bài học trung bình 0.5 giờ (30 phút)
        long completedLessons = lessonProgressRepository.findByAccount(account).stream()
                .filter(LessonProgress::getIsCompleted)
                .count();
        
        double hoursStudied = completedLessons * 0.5;

        return com.gnostica.dto.response.StudentStatsResponse.builder()
                .enrolledCourses(enrolledCourses)
                .completedCourses(completedCourses)
                .hoursStudied(hoursStudied)
                .build();
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

        int totalLessons = (int) course.getModules().stream()
                .flatMap(m -> m.getLessons().stream())
                .filter(l -> l.getStatus() != null && (l.getStatus() == 1 || l.getStatus() == 2))
                .count();

        int completedLessons = (int) courseProgress.stream()
                .filter(LessonProgress::getIsCompleted)
                .count();

        // Auto generate certifiUrl if missing
        if (enrollment.getProgressPercent() != null && enrollment.getProgressPercent() == 100 && enrollment.getCertifiUrl() == null) {
            enrollment.setCertifiUrl("UC-" + java.util.UUID.randomUUID().toString());
            if (enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            enrollmentRepository.save(enrollment);
            mailService.sendCourseCompletionEmail(enrollment);
            System.out.println(">>> DEBUG [getMyCourses] Generated certifiUrl: " + enrollment.getCertifiUrl());
        }

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
                .totalLessons(totalLessons)
                .completedLessons(completedLessons)
                .certifiUrl(enrollment.getCertifiUrl())
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
        
        // 1. Đếm tổng số Lessons + số Quizzes (cả 2 đều được xem là 1 "bước" học tập)
        long totalLessons = course.getModules().stream()
                .flatMap(m -> m.getLessons().stream())
                .count();

        long totalQuizzes = course.getModules().stream()
                .filter(m -> m.getQuiz() != null)
                .count();

        long totalSteps = totalLessons + totalQuizzes;
        if (totalSteps == 0) return;

        long completedLessons = lessonProgressRepository.findByAccount(account).stream()
                .filter(lp -> lp != null && lp.getIsCompleted() &&
                        lp.getLesson() != null &&
                        lp.getLesson().getModule() != null &&
                        lp.getLesson().getModule().getCourse() != null &&
                        Objects.equals(lp.getLesson().getModule().getCourse().getId(), courseId))
                .map(lp -> lp.getLesson().getId())
                .distinct()
                .count();

        // 3. Đếm số Quizzes đã hoàn thành (Chỉ tính các bài quiz có điểm >= 50)
        long completedQuizzes = quizResultRepository.findByAccount(account).stream()
                .filter(qr -> qr != null && qr.getQuiz() != null &&
                        qr.getQuiz().getModule() != null &&
                        qr.getQuiz().getModule().getCourse() != null &&
                        Objects.equals(qr.getQuiz().getModule().getCourse().getId(), courseId))
                .filter(qr -> {
                    Double point = qr.getPoint();
                    return point != null && point >= 50.0;
                })
                .map(qr -> qr.getQuiz().getId())
                .distinct()
                .count();

        long completedSteps = completedLessons + completedQuizzes;

        // Tính phần trăm & Lưu lại
        int progressPercent = (int) ((completedSteps * 100) / totalSteps);
        
        // Chặn lỗi logic nếu lỡ vượt 100%
        if (progressPercent > 100) progressPercent = 100;

        enrollment.setProgressPercent(progressPercent);
        if (progressPercent == 100) {
            if (enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(LocalDateTime.now());
            }
            if (enrollment.getCertifiUrl() == null) {
                enrollment.setCertifiUrl("UC-" + java.util.UUID.randomUUID().toString());
                mailService.sendCourseCompletionEmail(enrollment);
            }
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
