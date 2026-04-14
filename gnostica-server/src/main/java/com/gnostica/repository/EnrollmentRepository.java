package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Enrollment;
import com.gnostica.model.Account;
import com.gnostica.model.Course;
import java.util.Optional;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {
    Optional<Enrollment> findByAccountAndCourse(Account account, Course course);
    List<Enrollment> findByAccountId(Integer accountId);
}
