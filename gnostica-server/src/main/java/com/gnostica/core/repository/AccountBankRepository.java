package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.AccountBank;

@Repository
public interface AccountBankRepository extends JpaRepository<AccountBank, java.util.UUID> {
}

