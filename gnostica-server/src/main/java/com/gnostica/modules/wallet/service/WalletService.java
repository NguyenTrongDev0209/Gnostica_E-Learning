package com.gnostica.modules.wallet.service;

import com.gnostica.modules.wallet.dto.request.SetBankAccountRequest;
import com.gnostica.modules.wallet.dto.request.WithdrawRequest;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.model.Payout;
import com.gnostica.core.model.AccountBank;
import com.gnostica.core.model.Bank;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.WalletRepository;
import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.repository.AccountBankRepository;
import com.gnostica.core.repository.BankRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import vn.payos.model.v1.payouts.PayoutRequests;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final PayoutRepository payoutRepository;
    private final AccountRepository accountRepository;
    private final AccountBankRepository accountBankRepository;
    private final BankRepository bankRepository;
    private final PayoutsService payoutsService;
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
            newWallet.setRemain(BigDecimal.ZERO);
            newWallet.setStatus(1);
            newWallet.setType(1);
            return walletRepository.save(newWallet);
        });

        return wallet;
    }

    @Transactional(readOnly = true)
    public List<Payout> getMyTransactions() {
        Account account = getCurrentAccount();
        return payoutRepository.findByAccountOrderByCreatedAtDesc(account);
    }

    /**
     * Thiết lập tài khoản ngân hàng.
     */
    @Transactional
    public AccountBank setBankAccount(SetBankAccountRequest request) {
        Account account = getCurrentAccount();

        // Kiểm tra xem đã có AccountBank active nào chưa
        accountBankRepository.findByAccountAndStatus(account, 1).ifPresent(bank -> {
            throw new RuntimeException("Tài khoản ngân hàng đã được thiết lập. Vui lòng xóa trước khi cập nhật.");
        });

        if (request.getPin() == null || request.getPin().length() < 4) {
            throw new RuntimeException("PIN phải có ít nhất 4 ký tự.");
        }

        Bank bank = bankRepository.findById(Integer.valueOf(request.getBin()))
                .orElseThrow(() -> new RuntimeException("Ngân hàng không hợp lệ."));

        AccountBank accountBank = new AccountBank();
        accountBank.setAccount(account);
        accountBank.setBank(bank);
        accountBank.setAccountNumber(request.getAccountNumber());
        accountBank.setPin(bCryptPasswordEncoder.encode(request.getPin()));
        accountBank.setStatus(1); // Active

        return accountBankRepository.save(accountBank);
    }

    /**
     * Xóa tài khoản ngân hàng sau khi xác minh PIN.
     */
    @Transactional
    public void removeBankAccount(String pin) {
        Account account = getCurrentAccount();
        
        AccountBank accountBank = accountBankRepository.findByAccountAndStatus(account, 1)
                .orElseThrow(() -> new RuntimeException("Chưa thiết lập tài khoản ngân hàng."));

        if (accountBank.getPin() == null) {
            throw new RuntimeException("Chưa thiết lập mã PIN cho tài khoản ngân hàng.");
        }

        if (!bCryptPasswordEncoder.matches(pin, accountBank.getPin())) {
            throw new RuntimeException("Mã PIN không đúng.");
        }

        accountBank.setStatus(0); // Inactive
        accountBankRepository.save(accountBank);
    }

    /**
     * Rút tiền
     */
    @Transactional(rollbackFor = Exception.class)
    public vn.payos.model.v1.payouts.Payout withdraw(WithdrawRequest request) throws Exception {
        Wallet wallet = getMyWallet();
        Account account = wallet.getAccount();

        AccountBank accountBank = accountBankRepository.findByAccountAndStatus(account, 1)
                .orElseThrow(() -> new RuntimeException("Vui lòng thiết lập tài khoản ngân hàng trước khi rút tiền."));

        if (accountBank.getPin() == null || !bCryptPasswordEncoder.matches(request.getPin(), accountBank.getPin())) {
            throw new RuntimeException("Mã PIN không đúng.");
        }

        // Kiểm tra giới hạn rút tiền 3 lần/ngày
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        long withdrawalCountToday = payoutRepository.countByAccountAndCreatedAtAfter(account, startOfDay);
        if (withdrawalCountToday >= 3) {
            throw new RuntimeException("Bạn đã đạt giới hạn rút tiền tối đa 3 lần trong ngày hôm nay.");
        }

        BigDecimal amount = BigDecimal.valueOf(request.getAmount().doubleValue());

        if (wallet.getRemain() == null || wallet.getRemain().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư khả dụng không đủ để thực hiện lệnh rút tiền!");
        }

        PayoutRequests payoutRequest = new PayoutRequests();
        payoutRequest.setAmount(request.getAmount());
        payoutRequest.setToBin(accountBank.getBank().getBin()); // Bank entity must have getBin()
        payoutRequest.setToAccountNumber(accountBank.getAccountNumber());

        String desc = "Rut tien " + account.getFullName();
        if (desc.length() > 25) {
            desc = desc.substring(0, 25);
        }
        payoutRequest.setDescription(desc);

        vn.payos.model.v1.payouts.Payout payosPayout = payoutsService.createPayout(payoutRequest);

        wallet.setRemain(wallet.getRemain().subtract(amount));
        walletRepository.save(wallet);

        // Lưu vào bảng Payout
        Payout localPayout = new Payout();
        localPayout.setAmount(amount);
        localPayout.setStatus(1); // Pending
        localPayout.setAccount(account);
        localPayout.setWallet(wallet);
        localPayout.setAccountBank(accountBank);
        
        payoutRepository.save(localPayout);

        return payosPayout;
    }
}
