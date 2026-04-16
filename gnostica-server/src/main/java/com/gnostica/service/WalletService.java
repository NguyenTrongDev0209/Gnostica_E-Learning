package com.gnostica.service;

import com.gnostica.model.Account;
import com.gnostica.model.Wallet;
import com.gnostica.model.Transaction;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.WalletRepository;
import com.gnostica.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public Account getCurrentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found for email: " + email));
    }

    @Transactional(readOnly = true)
    public Wallet getMyWallet() {
        Account account = getCurrentAccount();
        return walletRepository.findByAccount(account).orElseGet(() -> {
            Wallet newWallet = new Wallet();
            newWallet.setAccount(account);
            newWallet.setRemain(0.0);
            newWallet.setStatus(1);
            return walletRepository.save(newWallet);
        });
    }

    @Transactional(readOnly = true)
    public List<Transaction> getMyTransactions() {
        Account account = getCurrentAccount();
        return transactionRepository.findByAccountOrderByCreatedAtDesc(account);
    }
}
