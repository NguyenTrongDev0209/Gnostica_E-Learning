package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Wallet;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, java.util.UUID> {
    
    @Query("SELECT COALESCE(SUM(w.remain), 0) FROM Wallet w WHERE w.account = :account AND w.status = 1 AND (w.availableAt IS NULL OR w.availableAt <= CURRENT_TIMESTAMP)")
    BigDecimal sumAvailableRemainByAccount(@Param("account") Account account);

    @Query("SELECT COALESCE(SUM(w.remain), 0) FROM Wallet w WHERE w.account = :account AND w.status = 1 AND w.type = 1 AND (w.availableAt IS NULL OR w.availableAt <= CURRENT_TIMESTAMP)")
    BigDecimal sumWithdrawableEarningsByAccount(@Param("account") Account account);

    @Query("SELECT COALESCE(SUM(w.remain), 0) FROM Wallet w WHERE w.account = :account AND w.status = 1 AND w.type = 1")
    BigDecimal sumTotalRevenueByAccount(@Param("account") Account account);

    @Query("SELECT COALESCE(SUM(w.remain), 0) FROM Wallet w WHERE w.account = :account AND w.status = 1 AND w.type = 1 AND w.availableAt > CURRENT_TIMESTAMP")
    BigDecimal sumPendingRevenueByAccount(@Param("account") Account account);

    @Query("SELECT COALESCE(SUM(w.remain), 0) FROM Wallet w WHERE w.account = :account AND w.status = 1 AND w.type = 1 AND w.createdAt >= :start AND w.createdAt < :end")
    BigDecimal sumRevenueByAccountAndCreatedAtBetween(
            @Param("account") Account account,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<Wallet> findByAccount(Account account);
}
