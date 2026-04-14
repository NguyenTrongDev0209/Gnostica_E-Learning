package com.gnostica.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Account;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Optional<Account> findByEmail(String email);
    boolean existsByEmail(String email);
}
