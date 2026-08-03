package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Payout;
import com.gnostica.core.model.Account;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, java.util.UUID> {
    long countByAccountAndCreatedAtAfter(Account account, LocalDateTime createdAt);
    java.util.List<Payout> findByAccountOrderByCreatedAtDesc(Account account);
    java.util.List<Payout> findByStatusIn(java.util.List<Integer> statuses);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payout p WHERE p.account = :account AND p.status IN :statuses")
    BigDecimal sumPayoutsByAccount(@Param("account") Account account, @Param("statuses") List<Integer> statuses);
}
