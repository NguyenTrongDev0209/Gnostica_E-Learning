package com.gnostica.listener;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;

import com.gnostica.model.Course;
import com.gnostica.model.Module;
import com.gnostica.model.Lesson;

public class AuditListener {

    @PrePersist
    public void setCreatedOn(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        if (entity instanceof Course course) {
            if (course.getCreatedAt() == null)
                course.setCreatedAt(now);
            course.setUpdatedAt(now);
        } else if (entity instanceof Module module) {
            if (module.getCreatedAt() == null)
                module.setCreatedAt(now);
            module.setUpdatedAt(now);
        } else if (entity instanceof Lesson lesson) {
            if (lesson.getCreatedAt() == null)
                lesson.setCreatedAt(now);
            lesson.setUpdatedAt(now);
        }
    }

    @PreUpdate
    public void setUpdatedOn(Object entity) {
        LocalDateTime now = LocalDateTime.now();
        if (entity instanceof Course course) {
            course.setUpdatedAt(now);
        } else if (entity instanceof Module module) {
            module.setUpdatedAt(now);
        } else if (entity instanceof Lesson lesson) {
            lesson.setUpdatedAt(now);
        }
    }
}
