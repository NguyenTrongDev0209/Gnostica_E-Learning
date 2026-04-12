package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    long countByStatus(Boolean status);
}
