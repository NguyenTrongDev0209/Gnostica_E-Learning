package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Payout;
import com.gnostica.core.model.Account;
import java.time.LocalDateTime;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, java.util.UUID> {
    long countByAccountAndCreatedAtAfter(Account account, LocalDateTime createdAt);
    java.util.List<Payout> findByAccountOrderByCreatedAtDesc(Account account);
}
