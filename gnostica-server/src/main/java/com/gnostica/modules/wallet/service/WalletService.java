package com.gnostica.modules.wallet.service;
import com.gnostica.service.*;

import com.gnostica.dto.SetBankAccountRequest;
import com.gnostica.dto.WithdrawRequest;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.model.Transaction;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.WalletRepository;
import com.gnostica.core.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import vn.payos.model.v1.payouts.Payout;
import vn.payos.model.v1.payouts.PayoutRequests;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final PayoutsService payoutsService;
    private final com.gnostica.core.repository.PayoutRepository payoutRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

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
        Wallet wallet = walletRepository.findByAccount(account).orElseGet(() -> {
            Wallet newWallet = new Wallet();
            newWallet.setAccount(account);
            newWallet.setRemain(0.0);
            newWallet.setStatus(1);
            return walletRepository.save(newWallet);
        });

        // Đếm số lượt rút tiền trong ngày (type = 2)
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        long count = transactionRepository.countByAccountAndTypeAndCreatedAtAfter(account, 2, startOfDay);
        wallet.setWithdrawalsToday(count);

        return wallet;
    }

    @Transactional(readOnly = true)
    public List<Transaction> getMyTransactions() {
        Account account = getCurrentAccount();
        return transactionRepository.findByAccountOrderByCreatedAtDesc(account);
    }

    /**
     * Thiết lập tài khoản ngân hàng lần đầu (hoặc sau khi đã xóa).
     * Nếu wallet đã có accountNumber thì từ chối — phải xóa trước.
     */
    @Transactional
    public Wallet setBankAccount(SetBankAccountRequest request) {
        Wallet wallet = getMyWallet();

        if (wallet.getAccountNumber() != null && !wallet.getAccountNumber().isBlank()) {
            throw new RuntimeException("Tài khoản ngân hàng đã được thiết lập. Vui lòng xóa trước khi cập nhật.");
        }

        if (request.getPin() == null || request.getPin().length() < 4) {
            throw new RuntimeException("PIN phải có ít nhất 4 ký tự.");
        }

        wallet.setBankBin(request.getBin());
        wallet.setAccountNumber(request.getAccountNumber());
        wallet.setPinHash(bCryptPasswordEncoder.encode(request.getPin()));
        return walletRepository.save(wallet);
    }

    /**
     * Xóa tài khoản ngân hàng sau khi xác minh PIN.
     */
    @Transactional
    public void removeBankAccount(String pin) {
        Wallet wallet = getMyWallet();

        if (wallet.getPinHash() == null) {
            throw new RuntimeException("Chưa thiết lập mã PIN cho ví.");
        }

        if (!bCryptPasswordEncoder.matches(pin, wallet.getPinHash())) {
            throw new RuntimeException("Mã PIN không đúng.");
        }

        wallet.setBankBin(null);
        wallet.setAccountNumber(null);
        wallet.setPinHash(null);
        walletRepository.save(wallet);
    }

    /**
     * Rút tiền — dùng thông tin ngân hàng đã lưu trong ví, xác thực bằng PIN.
     */
    @Transactional(rollbackFor = Exception.class)
    public Payout withdraw(WithdrawRequest request) throws Exception {
        Wallet wallet = getMyWallet();

        if (wallet.getAccountNumber() == null || wallet.getBankBin() == null) {
            throw new RuntimeException("Vui lòng thiết lập tài khoản ngân hàng trước khi rút tiền.");
        }

        if (wallet.getPinHash() == null || !bCryptPasswordEncoder.matches(request.getPin(), wallet.getPinHash())) {
            throw new RuntimeException("Mã PIN không đúng.");
        }

        // Kiểm tra giới hạn rút tiền 3 lần/ngày
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        long withdrawalCountToday = transactionRepository.countByAccountAndTypeAndCreatedAtAfter(wallet.getAccount(), 2,
                startOfDay);
        if (withdrawalCountToday >= 3) {
            throw new RuntimeException("Bạn đã đạt giới hạn rút tiền tối đa 3 lần trong ngày hôm nay.");
        }

        Double amount = request.getAmount().doubleValue();

        if (wallet.getRemain() == null || wallet.getRemain() < amount) {
            throw new RuntimeException("Số dư khả dụng không đủ để thực hiện lệnh rút tiền!");
        }

        PayoutRequests payoutRequest = new PayoutRequests();
        payoutRequest.setAmount(request.getAmount());
        payoutRequest.setToBin(wallet.getBankBin());
        payoutRequest.setToAccountNumber(wallet.getAccountNumber());

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
        transaction.setType(2); // 2: Trừ tiền
        transaction.setStatus(1); // 1: Thành công
        transaction.setPaymentMethod("WITHDRAW");
        transaction.setRef("Rút tiền về tài khoản ngân hàng");
        transaction.setTransactionCode(payout.getId());
        transaction.setCreatedAt(java.time.LocalDateTime.now());
        transaction.setAccount(wallet.getAccount());

        transactionRepository.save(transaction);

        com.gnostica.core.model.Payout localPayout = new com.gnostica.core.model.Payout();
        localPayout.setAmount(amount);
        localPayout.setStatus(1);
        localPayout.setTransaction(transaction);
        localPayout.setAccount(wallet.getAccount());
        localPayout.setCreatedAt(java.time.LocalDateTime.now());
        payoutRepository.save(localPayout);

        return payout;
    }
}
