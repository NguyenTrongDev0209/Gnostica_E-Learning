package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Review;
import com.gnostica.model.Course;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByCourseOrderByCreatedAtDesc(Course course);
}
