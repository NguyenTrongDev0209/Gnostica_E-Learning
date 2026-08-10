package com.gnostica.core.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Support;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface SupportRepository extends JpaRepository<Support, Integer> {
    List<Support> findByAccountOrderByCreatedAtDesc(Account account);
    List<Support> findByAssigneeOrderByUpdatedAtDesc(Account assignee);
    List<Support> findByStatusOrderByUpdatedAtDesc(Integer status);

    @Query("SELECT s.createdAt, s.status, s.type, s.priority FROM Support s WHERE s.createdAt >= :startDate AND s.deletedAt IS NULL")
    List<Object[]> getAdminStatsProjection(@Param("startDate") LocalDateTime startDate);
}
