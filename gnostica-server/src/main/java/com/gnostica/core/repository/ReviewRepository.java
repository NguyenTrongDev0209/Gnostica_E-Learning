package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Review;
import com.gnostica.core.model.Course;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByCourseOrderByCreatedAtDesc(Course course);
    List<Review> findByCourseAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(Course course, Integer status);
    java.util.Optional<Review> findByAccountAndCourseAndParentIsNull(com.gnostica.core.model.Account account, Course course);
    boolean existsByParent(Review parent);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.course.account.email = :instructorEmail AND r.course.deletedAt IS NULL")
    Double getAverageRatingByInstructorEmail(@org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.course.account.email = :instructorEmail AND r.course.deletedAt IS NULL GROUP BY r.rating")
    List<Object[]> countRatingsByInstructorEmail(@org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r WHERE r.course.account.email = :instructorEmail AND r.course.deletedAt IS NULL AND r.parent IS NULL ORDER BY r.createdAt DESC")
    List<Review> findReviewsByInstructorEmail(@org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    org.springframework.data.domain.Page<Review> findByCourseAccountIdAndCourseDeletedAtIsNullOrderByCreatedAtDesc(java.util.UUID instructorId, org.springframework.data.domain.Pageable pageable);
}
