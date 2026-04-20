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
import com.gnostica.dto.WithdrawRequest;
import vn.payos.model.v1.payouts.Payout;
import vn.payos.model.v1.payouts.PayoutRequests;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final PayoutsService payoutsService;
    private final com.gnostica.repository.PayoutRepository payoutRepository;

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

    @Transactional(rollbackFor = Exception.class)
    public Payout withdraw(WithdrawRequest request) throws Exception {
        Wallet wallet = getMyWallet();
        Double amount = request.getAmount().doubleValue();

        if (wallet.getRemain() == null || wallet.getRemain() < amount) {
            throw new RuntimeException("Số dư khả dụng không đủ để thực hiện lệnh rút tiền!");
        }

        PayoutRequests payoutRequest = new PayoutRequests();
        payoutRequest.setAmount(request.getAmount().longValue());
        payoutRequest.setToBin(request.getBin());
        payoutRequest.setToAccountNumber(request.getAccountNumber());

        String desc = "Rut tien " + wallet.getAccount().getFullName();
        if (desc.length() > 25) {
            desc = desc.substring(0, 25);
        }
        payoutRequest.setDescription(desc);

        Payout payout = payoutsService.createPayout(payoutRequest);

        wallet.setRemain(wallet.getRemain() - amount);
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setAmount(amount);
        transaction.setType(2); // 2: Tru tien, Giam tru
        transaction.setStatus(1); // 1: Thanh cong
        transaction.setPaymentMethod("WITHDRAW");
        transaction.setRef("Rút tiền về tài khoản ngân hàng");
        transaction.setTransactionCode(payout.getId());
        transaction.setCreatedAt(java.time.LocalDateTime.now());
        transaction.setAccount(wallet.getAccount());

        transactionRepository.save(transaction);

        com.gnostica.model.Payout localPayout = new com.gnostica.model.Payout();
        localPayout.setAmount(amount);
        localPayout.setStatus(1);
        localPayout.setTransaction(transaction);
        localPayout.setAccount(wallet.getAccount());
        localPayout.setCreatedAt(java.time.LocalDateTime.now());
        payoutRepository.save(localPayout);

        return payout;
    }
}
