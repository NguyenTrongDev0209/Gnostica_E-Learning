package com.gnostica.service;

import com.gnostica.dto.LessonProgressDTO;
import com.gnostica.model.Account;
import com.gnostica.model.Lesson;
import com.gnostica.model.LessonProgress;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.LessonProgressRepository;
import com.gnostica.repository.LessonRepository;
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

    @Transactional
    public void markLessonAsCompleted(Integer lessonId, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Bài học không tồn tại"));

        LessonProgress progress = lessonProgressRepository.findByAccountAndLesson(account, lesson)
                .orElse(new LessonProgress());

        if (progress.getId() == null) {
            progress.setAccount(account);
            progress.setLesson(lesson);
        }

        if (!progress.getIsCompleted()) {
            progress.setIsCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
            
            // Cập nhật tiến độ tổng quan cho Enrollment
            enrollmentService.updateProgress(account.getId(), lesson.getModule().getCourse().getId());
        }
    }

    @Transactional
    public void updateLastWatchedTime(Integer lessonId, String email, Integer time) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Bài học không tồn tại"));

        LessonProgress progress = lessonProgressRepository.findByAccountAndLesson(account, lesson)
                .orElse(new LessonProgress());

        if (progress.getId() == null) {
            progress.setAccount(account);
            progress.setLesson(lesson);
            progress.setIsCompleted(false);
        }
        
        // Chỉ cập nhật thời gian nếu bài học chưa hoàn thành hoặc để Resume chính xác
        progress.setLastWatchedTime(time);
        lessonProgressRepository.save(progress);
    }

    @Transactional(readOnly = true)
    public List<LessonProgressDTO> getCourseProgressBySlug(String slug, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return lessonProgressRepository.findAll().stream()
                .filter(lp -> lp.getAccount().getId().equals(account.getId()) 
                           && lp.getLesson().getModule().getCourse().getSlug().equals(slug))
                .map(lp -> LessonProgressDTO.builder()
                        .lessonId(lp.getLesson().getId())
                        .isCompleted(lp.getIsCompleted())
                        .lastWatchedTime(lp.getLastWatchedTime())
                        .updatedAt(lp.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Integer> getCompletedLessonIdsByCourseSlug(String slug, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return lessonProgressRepository.findAll().stream()
                .filter(lp -> lp.getAccount().getId().equals(account.getId()) 
                           && lp.getLesson().getModule().getCourse().getSlug().equals(slug)
                           && lp.getIsCompleted())
                .map(lp -> lp.getLesson().getId())
                .collect(Collectors.toList());
    }
}
