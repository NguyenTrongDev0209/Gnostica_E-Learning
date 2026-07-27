package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Wallet;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, java.util.UUID> {
    
    @Query("SELECT COALESCE(SUM(w.remain), 0) FROM Wallet w WHERE w.account = :account AND w.status = 1 AND (w.availableAt IS NULL OR w.availableAt <= CURRENT_TIMESTAMP)")
    BigDecimal sumAvailableRemainByAccount(@Param("account") Account account);

    List<Wallet> findByAccount(Account account);
}
