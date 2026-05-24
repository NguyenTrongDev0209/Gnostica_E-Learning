package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Enrollment;
import com.gnostica.model.Account;
import com.gnostica.model.Course;
import java.util.Optional;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {
    Optional<Enrollment> findByAccountAndCourse(Account account, Course course);
    List<Enrollment> findByAccount(Account account);
    Optional<Enrollment> findByCertifiUrl(String certifiUrl);
    
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e WHERE e.progressPercent = 100 AND (e.certificateEmailSent = false OR e.certificateEmailSent IS NULL)")
    List<Enrollment> findCompletedEnrollmentsWithoutEmail();
}
