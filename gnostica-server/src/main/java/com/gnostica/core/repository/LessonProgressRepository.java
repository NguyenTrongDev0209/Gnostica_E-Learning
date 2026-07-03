package com.gnostica.core.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.LessonProgress;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Lesson;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Integer> {
    java.util.List<LessonProgress> findByAccount(Account account);
    Optional<LessonProgress> findByAccountAndLesson(Account account, Lesson lesson);
}
