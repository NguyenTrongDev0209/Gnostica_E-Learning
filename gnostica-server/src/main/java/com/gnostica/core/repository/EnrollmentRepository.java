package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import java.util.Optional;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {
    Optional<Enrollment> findByAccountAndCourse(Account account, Course course);

    List<Enrollment> findByAccount(Account account);

    boolean existsByAccountAndCourseAndStatusIn(Account account, Course course, java.util.Collection<Integer> statuses);
    
    List<Enrollment> findByAccountAndCertificateUrlIsNotNull(Account account);

    Optional<Enrollment> findByCertificateUrl(String certificateUrl);




    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e JOIN e.course c WHERE c.account.email = :email")
    List<Enrollment> findStudentsByInstructorEmail(
            @org.springframework.data.repository.query.Param("email") String email);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e JOIN e.course c WHERE e.account.id = :studentId AND c.account.email = :instructorEmail")
    List<Enrollment> findByAccountIdAndInstructorEmail(
            @org.springframework.data.repository.query.Param("studentId") java.util.UUID studentId,
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);



    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM Enrollment e JOIN e.course c WHERE c.account.email = :instructorEmail AND e.createdAt >= :startDate AND e.createdAt < :endDate")
    long countStudentsByInstructorEmailAndDateRange(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM Enrollment e JOIN e.course c WHERE c.account.email = :instructorEmail")
    long countTotalStudentsByInstructorEmail(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    org.springframework.data.domain.Page<Enrollment> findByAccountIdOrderByCreatedAtDesc(java.util.UUID accountId, org.springframework.data.domain.Pageable pageable);
    
    long countByAccountId(java.util.UUID accountId);
}
