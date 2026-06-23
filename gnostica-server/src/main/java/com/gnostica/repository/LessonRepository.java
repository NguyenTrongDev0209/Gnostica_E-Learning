package com.gnostica.repository;

import com.gnostica.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) > 0 FROM Lesson l WHERE l.videoUrl = :videoUrl AND (l.deleted = false OR l.deleted IS NULL)")
    boolean existsByVideoUrl(@org.springframework.data.repository.query.Param("videoUrl") String videoUrl);
}
