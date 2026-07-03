package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Review;
import com.gnostica.core.model.Course;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByCourseOrderByCreatedAtDesc(Course course);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.course.account.email = :instructorEmail AND (r.course.deleted = false OR r.course.deleted IS NULL)")
    Double getAverageRatingByInstructorEmail(@org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.course.account.email = :instructorEmail AND (r.course.deleted = false OR r.course.deleted IS NULL) GROUP BY r.rating")
    List<Object[]> countRatingsByInstructorEmail(@org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r WHERE r.course.account.email = :instructorEmail AND (r.course.deleted = false OR r.course.deleted IS NULL) ORDER BY r.createdAt DESC")
    List<Review> findReviewsByInstructorEmail(@org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);
}
