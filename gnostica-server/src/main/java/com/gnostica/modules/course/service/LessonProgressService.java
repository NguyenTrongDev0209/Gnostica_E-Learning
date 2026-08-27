package com.gnostica.modules.course.service;

import com.gnostica.modules.course.dto.response.LessonProgressDTO;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Lesson;
import com.gnostica.core.model.LessonProgress;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.LessonProgressRepository;
import com.gnostica.core.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

        private final LessonProgressRepository lessonProgressRepository;
        private final LessonRepository lessonRepository;
        private final AccountRepository accountRepository;
        private final EnrollmentService enrollmentService;
        private final com.gnostica.core.repository.QuizResultRepository quizResultRepository; // Inject Quiz Repo
        private final com.gnostica.core.repository.EnrollmentRepository enrollmentRepository; // Inject Enrollment Repo

        @Transactional
        public void markLessonAsCompleted(Integer lessonId, String email) {
                Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                Lesson lesson = lessonRepository.findById(lessonId)
                                .orElseThrow(() -> new RuntimeException("Bài học không tồn tại"));

                LessonProgress progress = lessonProgressRepository.findByAccountAndLesson(account, lesson)
                                .orElse(new LessonProgress());

                if (progress.getId() == null) {
                        progress.setAccount(account);
                        progress.setLesson(lesson);
                }

                if (progress.getStatus() == null || progress.getStatus() != 2) {
                        progress.setStatus(2);
                        progress.setCompletedAt(LocalDateTime.now());
                        lessonProgressRepository.save(progress);

                        // Cập nhật tiến độ tổng quan cho Enrollment
                        enrollmentService.updateProgress(account.getId(), lesson.getModule().getCourse().getId());
                }
        }

        @Transactional
        public void updateLastWatchedTime(Integer lessonId, String email, String time) {
                Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                Lesson lesson = lessonRepository.findById(lessonId)
                                .orElseThrow(() -> new RuntimeException("Bài học không tồn tại"));

                LessonProgress progress = lessonProgressRepository.findByAccountAndLesson(account, lesson)
                                .orElse(new LessonProgress());

                if (progress.getId() == null) {
                        progress.setAccount(account);
                        progress.setLesson(lesson);
                        progress.setStatus(1);
                }

                // Chỉ cập nhật thời gian nếu bài học chưa hoàn thành hoặc để Resume chính xác
                progress.setLastWatchedAt(time);
                lessonProgressRepository.save(progress);
        }

        @Transactional
        public com.gnostica.modules.course.dto.response.CourseProgressResponse getCourseProgressBySlug(String slug,
                        String email) {
                Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                // 0. Lấy Enrollment
                com.gnostica.core.model.Enrollment enrollment = enrollmentRepository.findByAccount(account).stream()
                                .filter(e -> e.getCourse().getSlug().equals(slug))
                                .findFirst()
                                .orElse(null);

                // Auto generate certificateUrl if missing
                if (enrollment != null && enrollment.getProgressPercent() != null
                                && enrollment.getProgressPercent() == 100 && enrollment.getCertificateUrl() == null) {
                        enrollment.setCertificateUrl("UC-" + java.util.UUID.randomUUID().toString());
                        enrollmentRepository.save(enrollment);
                }

                // 1. Lấy Tiến trình Video
                List<LessonProgressDTO> lessons = lessonProgressRepository.findAll().stream()
                                .filter(lp -> lp.getAccount().getId().equals(account.getId())
                                                && lp.getLesson().getModule().getCourse().getSlug().equals(slug))
                                .map(lp -> LessonProgressDTO.builder()
                                                .lessonId(lp.getLesson().getId())
                                                .isCompleted(lp.getStatus() != null && lp.getStatus() == 2)
                                                .lastWatchedTime(lp.getLastWatchedAt())
                                                .updatedAt(lp.getUpdatedAt())
                                                .build())
                                .collect(Collectors.toList());

                // 2. Lấy Kết quả Quiz
                List<com.gnostica.modules.course.dto.response.QuizResultDTO> quizzes = quizResultRepository
                                .findByAccount(account).stream()
                                .filter(qr -> qr.getQuiz() != null
                                                && qr.getQuiz().getModule() != null
                                                && qr.getQuiz().getModule().getCourse() != null
                                                && qr.getQuiz().getModule().getCourse().getSlug().equals(slug))
                                .map(qr -> com.gnostica.modules.course.dto.response.QuizResultDTO.builder()
                                                .quizId(qr.getQuiz().getId())
                                                .point(qr.getPoint())
                                                .totalQuestions(qr.getTotalQuestions())
                                                .correctAnswers(qr.getCorrectAnswers())
                                                .completedAt(qr.getCompletedAt())
                                                .status(qr.getStatus())
                                                .build())
                                .collect(Collectors.toList());

                // Trả về object gộp
                return com.gnostica.modules.course.dto.response.CourseProgressResponse.builder()
                                .lessons(lessons)
                                .quizzes(quizzes)
                                .certificateUrl(enrollment != null ? enrollment.getCertificateUrl() : null)
                                .progressPercent(enrollment != null ? enrollment.getProgressPercent() : 0)
                                .build();
        }

        @Transactional(readOnly = true)
        public List<Integer> getCompletedLessonIdsByCourseSlug(String slug, String email) {
                Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

                return lessonProgressRepository.findAll().stream()
                                .filter(lp -> lp.getAccount().getId().equals(account.getId())
                                                && lp.getLesson().getModule().getCourse().getSlug().equals(slug)
                                                && lp.getStatus() != null && lp.getStatus() == 2)
                                .map(lp -> lp.getLesson().getId())
                                .collect(Collectors.toList());
        }
}
