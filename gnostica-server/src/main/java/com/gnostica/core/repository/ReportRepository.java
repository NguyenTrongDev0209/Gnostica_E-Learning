package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Report;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {
    void deleteByTargetIdAndTargetType(String targetId, String targetType);
    boolean existsByTargetIdAndTargetTypeAndAccount_Email(String targetId, String targetType, String email);
    boolean existsByTargetIdAndTargetTypeAndAccount_EmailAndStatus(String targetId, String targetType, String email, Integer status);
    org.springframework.data.domain.Page<Report> findByTargetType(String targetType, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Report> findByTargetTypeAndStatus(String targetType, Integer status, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT r.createdAt, r.status, r.reason FROM Report r WHERE r.createdAt >= :startDate AND r.targetType = :targetType AND r.deletedAt IS NULL")
    List<Object[]> getAdminStatsProjection(@Param("startDate") LocalDateTime startDate, @Param("targetType") String targetType);

    List<Report> findByCreatedAtAfterAndDeletedAtIsNull(LocalDateTime createdAt);
}
