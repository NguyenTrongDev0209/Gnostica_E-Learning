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

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e JOIN e.course c WHERE c.account.email = :email AND (c.deleted = false OR c.deleted IS NULL)")
    List<Enrollment> findStudentsByInstructorEmail(
            @org.springframework.data.repository.query.Param("email") String email);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e JOIN e.course c WHERE e.account.id = :studentId AND c.account.email = :instructorEmail AND (c.deleted = false OR c.deleted IS NULL)")
    List<Enrollment> findByAccountIdAndInstructorEmail(
            @org.springframework.data.repository.query.Param("studentId") Integer studentId,
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);
}
