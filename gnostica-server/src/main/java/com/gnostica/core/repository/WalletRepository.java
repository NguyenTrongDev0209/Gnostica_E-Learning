package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Wallet;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, java.util.UUID> {
    Optional<Wallet> findByAccount(Account account);
}
