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
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.wallet.dto.response.WalletOverviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final PaymentRepository paymentRepository;
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
        return getWalletByAccount(getCurrentAccount());
    }

    @Transactional(readOnly = true)
    public WalletOverviewResponse getMyWalletOverview() {
        Account account = getCurrentAccount();
        Wallet wallet = getWalletByAccount(account);
        LocalDateTime startOfMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        AccountBank activeBank = accountBankRepository.findByAccountAndStatus(account, 1).orElse(null);

        return WalletOverviewResponse.builder()
                .accountId(account.getId())
                .remain(wallet.getRemain())
                .totalRevenue(walletRepository.sumTotalRevenueByAccount(account))
                .currentMonthRevenue(walletRepository.sumRevenueByAccountAndCreatedAtBetween(
                        account, startOfMonth, startOfNextMonth))
                .pendingRevenue(walletRepository.sumPendingRevenueByAccount(account))
                .type(wallet.getType())
                .status(wallet.getStatus())
                .withdrawalsToday(payoutRepository.countByAccountAndCreatedAtAfter(account, startOfDay))
                .accountNumber(activeBank == null ? null : activeBank.getAccountNumber())
                .bankBin(activeBank == null || activeBank.getBank() == null ? null : activeBank.getBank().getBin())
                .bankName(activeBank == null || activeBank.getBank() == null ? null : activeBank.getBank().getShortName())
                .build();
    }

    @Transactional(readOnly = true)
    public Wallet getWalletByAccount(Account account) {
        BigDecimal totalEarning = walletRepository.sumAvailableRemainByAccount(account);
        BigDecimal totalPayout = payoutRepository.sumPayoutsByAccount(account, List.of(1, 2, 3)); // 1: Pending, 2: Processing, 3: Completed
        BigDecimal totalWalletPayment = paymentRepository.sumWalletPaymentsByAccount(account);
        
        BigDecimal balance = totalEarning.subtract(totalPayout).subtract(totalWalletPayment);
        if (balance.compareTo(BigDecimal.ZERO) < 0) {
            balance = BigDecimal.ZERO;
        }

        Wallet dummyWallet = new Wallet();
        dummyWallet.setAccount(account);
        dummyWallet.setRemain(balance);
        dummyWallet.setStatus(1);
        dummyWallet.setType(1);
        return dummyWallet;
    }

    /** Serializes outgoing wallet spending for one account. */
    @Transactional
    public Wallet getWalletByAccountForPayment(Account account) {
        Account lockedAccount = accountRepository.findByIdForUpdate(account.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return getWalletByAccount(lockedAccount);
    }

    @Transactional
    public void addBalance(java.util.UUID accountId, double amount, String reason) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));
        
        Wallet wallet = new Wallet();
        wallet.setAccount(account);
        wallet.setRemain(BigDecimal.valueOf(amount));
        wallet.setStatus(1); // 1: Active
        wallet.setType(1); // Assuming 1 means available immediately
        walletRepository.save(wallet);
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

        Bank bank = bankRepository.findByBin(request.getBin())
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
        Account account = accountRepository.findByIdForUpdate(getCurrentAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        Wallet wallet = getWalletByAccount(account);

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

        // Lưu vào bảng Payout
        Payout localPayout = new Payout();
        localPayout.setAmount(amount);
        localPayout.setStatus(1); // Pending
        localPayout.setAccount(account);
        localPayout.setAccountBank(accountBank);
        payoutRepository.save(localPayout);

        return payosPayout;
    }

    @Transactional
    public Wallet addDeposit(Account account, BigDecimal amount, String referenceId) {
        Wallet wallet = new Wallet();
        wallet.setAccount(account);
        wallet.setRemain(amount);
        wallet.setStatus(1);
        wallet.setType(4); // DEPOSIT_OVERDUE
        wallet.setTargetType("PAYMENT_ID");
        if (referenceId != null) {
            try {
                wallet.setTargetId(java.util.UUID.fromString(referenceId));
            } catch (Exception e) {}
        }
        return walletRepository.save(wallet);
    }


}
