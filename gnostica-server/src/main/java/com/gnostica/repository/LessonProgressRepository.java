package com.gnostica.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.LessonProgress;
import com.gnostica.model.Account;
import com.gnostica.model.Lesson;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Integer> {
    java.util.List<LessonProgress> findByAccount(Account account);
    Optional<LessonProgress> findByAccountAndLesson(Account account, Lesson lesson);
}
