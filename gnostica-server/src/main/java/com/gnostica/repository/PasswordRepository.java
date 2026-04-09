package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Password;
import com.gnostica.model.Account;
import java.util.Optional;

public interface PasswordRepository extends JpaRepository<Password, Integer> {
    Optional<Password> findByAccountAndStatus(Account account, Integer status);
}
