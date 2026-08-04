package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.AccountBank;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Bank;
import java.util.Optional;

@Repository
public interface AccountBankRepository extends JpaRepository<AccountBank, java.util.UUID> {
    Optional<AccountBank> findByAccountAndStatus(Account account, Integer status);

    Optional<AccountBank> findByAccountAndBankAndAccountNumber(Account account, Bank bank, String accountNumber);
}

