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

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.account.id) FROM Enrollment e JOIN e.course c WHERE c.account.email = :instructorEmail")
    long countDistinctStudentsByInstructorEmail(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT e.account.id) FROM Enrollment e JOIN e.course c WHERE c.account.email = :instructorEmail AND e.status IN (1, 2) AND e.createdAt >= :startDate AND e.createdAt < :endDate")
    long countDistinctActiveStudentsByInstructorEmailAndDateRange(
            @org.springframework.data.repository.query.Param("instructorEmail") String instructorEmail,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.account.id = :accountId AND e.status IN (1, 2)")
    long countActiveByCourseAccountId(@org.springframework.data.repository.query.Param("accountId") java.util.UUID accountId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.account.id = :accountId AND e.status IN (1, 2) AND e.progressPercent = 100")
    long countCompletedByCourseAccountId(@org.springframework.data.repository.query.Param("accountId") java.util.UUID accountId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.account.id = :accountId AND e.status IN (1, 2) AND e.progressPercent = 100 AND COALESCE(e.completedAt, e.createdAt) >= :startDate AND COALESCE(e.completedAt, e.createdAt) < :endDate")
    long countCompletedByCourseAccountIdAndDateRange(
            @org.springframework.data.repository.query.Param("accountId") java.util.UUID accountId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate);

    org.springframework.data.domain.Page<Enrollment> findByAccountIdOrderByCreatedAtDesc(java.util.UUID accountId, org.springframework.data.domain.Pageable pageable);
    
    long countByAccountId(java.util.UUID accountId);
    long countByCourseId(java.util.UUID courseId);
    long countByProgressPercentEquals(Integer progressPercent);
    long countByProgressPercentLessThan(Integer progressPercent);
    long countByCourseAccountId(java.util.UUID accountId);
    long countByCourseAccountIdAndProgressPercentEquals(java.util.UUID accountId, Integer progressPercent);
    long countByCourseAccountIdAndProgressPercentLessThan(java.util.UUID accountId, Integer progressPercent);
    long countByProgressPercentEqualsAndCreatedAtBetween(Integer progressPercent, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    long countByProgressPercentLessThanAndCreatedAtBetween(Integer progressPercent, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    long countByCourseAccountIdAndProgressPercentEqualsAndCreatedAtBetween(java.util.UUID accountId, Integer progressPercent, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    long countByCourseAccountIdAndProgressPercentLessThanAndCreatedAtBetween(java.util.UUID accountId, Integer progressPercent, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
