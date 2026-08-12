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
import com.gnostica.modules.wallet.dto.response.PayoutResponse;
import com.gnostica.modules.wallet.dto.response.WalletTransactionResponse;
import com.gnostica.core.constant.PayoutStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.gnostica.modules.wallet.event.PayoutSubmissionRequestedEvent;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final PayoutRepository payoutRepository;
    private final AccountRepository accountRepository;
    private final AccountBankRepository accountBankRepository;
    private final BankRepository bankRepository;
    private final PaymentRepository paymentRepository;
    private final PayoutSecurityService payoutSecurityService;
    private final ApplicationEventPublisher eventPublisher;
    private final PayoutSubmissionService payoutSubmissionService;
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
                .withdrawalsToday(payoutRepository.countByAccountAndStatusInAndCreatedAtAfter(account,
                        List.of(PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.COMPLETED), startOfDay))
                .accountNumber(activeBank == null ? null : maskAccountNumber(activeBank.getAccountNumber()))
                .bankBin(activeBank == null || activeBank.getBank() == null ? null : activeBank.getBank().getBin())
                .bankName(
                        activeBank == null || activeBank.getBank() == null ? null : activeBank.getBank().getShortName())
                .build();
    }

    @Transactional(readOnly = true)
    public Wallet getWalletByAccount(Account account) {
        BigDecimal totalEarning = walletRepository.sumAvailableRemainByAccount(account);
        BigDecimal totalPayout = payoutRepository.sumPayoutsByAccount(account, List.of(1, 2, 3)); // 1: Pending, 2:
                                                                                                  // Processing, 3:
                                                                                                  // Completed
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



    @Transactional(readOnly = true)
    public List<PayoutResponse> getMyTransactions() {
        Account account = getCurrentAccount();
        return payoutRepository.findByAccountOrderByCreatedAtDesc(account).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getMyTransactionHistory() {
        Account account = getCurrentAccount();
        
        List<WalletTransactionResponse> history = new java.util.ArrayList<>();
        
        // Payouts
        List<Payout> payouts = payoutRepository.findByAccountOrderByCreatedAtDesc(account);
        for (Payout p : payouts) {
            String statusStr = switch (p.getStatus()) {
                case PayoutStatus.PENDING -> "PENDING";
                case PayoutStatus.PROCESSING -> "PROCESSING";
                case PayoutStatus.COMPLETED -> "COMPLETED";
                case PayoutStatus.FAILED -> "FAILED";
                case PayoutStatus.REJECTED -> "REJECTED";
                default -> "UNKNOWN";
            };
            history.add(WalletTransactionResponse.builder()
                .id(p.getId())
                .category("WITHDRAWAL")
                .amount(p.getAmount())
                .createdAt(p.getCreatedAt())
                .reference(p.getGatewayReferenceId())
                .bankName(p.getAccountBank() == null || p.getAccountBank().getBank() == null ? null : p.getAccountBank().getBank().getShortName())
                .maskedAccountNumber(p.getAccountBank() == null ? null : maskAccountNumber(p.getAccountBank().getAccountNumber()))
                .status(statusStr)
                .build());
        }
        
        // Wallets
        List<Wallet> wallets = walletRepository.findByAccount(account);
        for (Wallet w : wallets) {
            if (w.getType() != null) {
                String category = switch (w.getType()) {
                    case 1 -> "EARNING";
                    case 4 -> "DEPOSIT";
                    case 5 -> "GIFT_REFUND";
                    case 6 -> "REFUND";
                    default -> null;
                };
                if (category != null) {
                    history.add(WalletTransactionResponse.builder()
                        .id(w.getId())
                        .category(category)
                        .amount(w.getRemain())
                        .createdAt(w.getCreatedAt())
                        .reference(w.getTargetType() + (w.getTargetId() != null ? ":" + w.getTargetId() : ""))
                        .bankName(null)
                        .maskedAccountNumber(null)
                        .status(w.getStatus() != null && w.getStatus() == 1 ? "COMPLETED" : "VOIDED")
                        .build());
                }
            }
        }
        
        history.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        
        return history;
    }

    /**
     * Thiết lập tài khoản ngân hàng.
     */
    @Transactional
    public AccountBank setBankAccount(SetBankAccountRequest request) {
        Account account = getCurrentAccount();
        assertAccountCanWithdraw(account);
        if (request == null || request.getAccountNumber() == null
                || !request.getAccountNumber().trim().matches("\\d{6,25}")) {
            throw new RuntimeException("Số tài khoản ngân hàng không hợp lệ.");
        }

        // Kiểm tra xem đã có AccountBank active nào chưa
        accountBankRepository.findByAccountAndStatus(account, 1).ifPresent(bank -> {
            throw new RuntimeException("Tài khoản ngân hàng đã được thiết lập. Vui lòng xóa trước khi cập nhật.");
        });

        if (request.getPin() == null || !request.getPin().matches("\\d{6}")) {
            throw new RuntimeException("PIN phải gồm đúng 6 chữ số.");
        }

        Bank bank = bankRepository.findByBin(request.getBin())
                .orElseThrow(() -> new RuntimeException("Ngân hàng không hợp lệ."));

        String accountNumber = request.getAccountNumber().trim();
        AccountBank accountBank = accountBankRepository
                .findByAccountAndBankAndAccountNumber(account, bank, accountNumber)
                .orElseGet(() -> {
                    AccountBank newAccountBank = new AccountBank();
                    newAccountBank.setAccount(account);
                    newAccountBank.setBank(bank);
                    newAccountBank.setAccountNumber(accountNumber);
                    return newAccountBank;
                });

        // Kích hoạt lại bản ghi cũ (nếu có) thay vì chèn trùng unique key.
        accountBank.setPin(bCryptPasswordEncoder.encode(request.getPin()));
        accountBank.setStatus(1);
        accountBank.setDeletedAt(null);

        return accountBankRepository.save(accountBank);
    }

    /**
     * Xóa tài khoản ngân hàng sau khi xác minh PIN.
     */
    @Transactional
    public void removeBankAccount(String pin) {
        Account account = getCurrentAccount();
        assertAccountCanWithdraw(account);

        AccountBank accountBank = accountBankRepository.findByAccountAndStatus(account, 1)
                .orElseThrow(() -> new RuntimeException("Chưa thiết lập tài khoản ngân hàng."));

        if (accountBank.getPin() == null) {
            throw new RuntimeException("Chưa thiết lập mã PIN cho tài khoản ngân hàng.");
        }

        payoutSecurityService.assertPinCanBeTried(account.getId());
        if (!bCryptPasswordEncoder.matches(pin, accountBank.getPin())) {
            payoutSecurityService.recordInvalidPin(account.getId());
            throw new RuntimeException("Mã PIN không đúng.");
        }

        payoutSecurityService.clearInvalidPinAttempts(account.getId());
        if (payoutRepository.existsByAccountBankAndStatusIn(accountBank,
                List.of(PayoutStatus.PENDING, PayoutStatus.PROCESSING))) {
            throw new RuntimeException("Không thể thay đổi tài khoản ngân hàng khi có lệnh rút đang xử lý.");
        }
        accountBank.setStatus(0); // Inactive
        accountBankRepository.save(accountBank);
    }

    /**
     * Rút tiền
     */
    @Transactional(rollbackFor = Exception.class)
    public Payout withdraw(WithdrawRequest request, String idempotencyKey) {

        Account account = accountRepository.findByIdForUpdate(getCurrentAccount().getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        assertAccountCanWithdraw(account);

        if (idempotencyKey == null || !idempotencyKey.matches("[A-Za-z0-9_-]{16,100}")) {
            throw new RuntimeException("Yêu cầu rút tiền không hợp lệ.");
        }
        Payout existing = payoutRepository.findByAccountAndIdempotencyKey(account, idempotencyKey).orElse(null);
        if (existing != null) {
            return existing;
        }

        payoutSecurityService.assertWithdrawalRequestAllowed(account.getId());
        if (request == null || request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Số tiền rút phải lớn hơn 0.");
        }
        if (request.getAmount() < 10_000L) {
            throw new RuntimeException("Số tiền rút tối thiểu là 10.000đ.");
        }
        Wallet wallet = getWalletByAccount(account);

        AccountBank accountBank = accountBankRepository.findByAccountAndStatus(account, 1)
                .orElseThrow(() -> new RuntimeException("Vui lòng thiết lập tài khoản ngân hàng trước khi rút tiền."));

        payoutSecurityService.assertPinCanBeTried(account.getId());
        if (accountBank.getPin() == null || !bCryptPasswordEncoder.matches(request.getPin(), accountBank.getPin())) {
            payoutSecurityService.recordInvalidPin(account.getId());
            throw new RuntimeException("Mã PIN không đúng.");
        }
        payoutSecurityService.clearInvalidPinAttempts(account.getId());

        // Kiểm tra giới hạn rút tiền 3 lần/ngày
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        long withdrawalCountToday = payoutRepository.countByAccountAndStatusInAndCreatedAtAfter(account,
                List.of(PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.COMPLETED), startOfDay);
        if (withdrawalCountToday >= 3) {
            throw new RuntimeException("Bạn đã đạt giới hạn rút tiền tối đa 3 lần trong ngày hôm nay.");
        }

        BigDecimal amount = BigDecimal.valueOf(request.getAmount());

        if (wallet.getRemain() == null || wallet.getRemain().compareTo(amount) < 0) {
            throw new RuntimeException("Số dư khả dụng không đủ để thực hiện lệnh rút tiền!");
        }

        String referenceId = generateUniqueGatewayReferenceId();

        Payout localPayout = new Payout();
        localPayout.setAmount(amount);
        localPayout.setStatus(PayoutStatus.PENDING);
        localPayout.setAccount(account);
        localPayout.setAccountBank(accountBank);
        localPayout.setGatewayReferenceId(referenceId);
        localPayout.setIdempotencyKey(idempotencyKey);
        localPayout.setSubmissionAttempts(0);

        localPayout = payoutRepository.saveAndFlush(localPayout);
        payoutSubmissionService.submit(localPayout.getId());

        return payoutRepository.findById(localPayout.getId()).orElse(localPayout);
    }

    /**
     * Creates a readable, gateway-safe withdrawal reference. The database unique
     * index on gateway_reference_id remains the final integrity safeguard.
     */
    private String generateUniqueGatewayReferenceId() {
        for (int attempt = 0; attempt < 5; attempt++) {
            long code = 100_000_000_000L
                    + java.util.concurrent.ThreadLocalRandom.current().nextLong(900_000_000_000L);
            String referenceId = "RT" + code;
            if (!payoutRepository.existsByGatewayReferenceId(referenceId)) {
                return referenceId;
            }
        }
        throw new IllegalStateException("Unable to create a unique withdrawal reference.");
    }

    private void assertAccountCanWithdraw(Account account) {
        if (account.getStatus() == null || account.getStatus() != 1 || account.getDeletedAt() != null) {
            throw new RuntimeException("Tài khoản không đủ điều kiện rút tiền.");
        }
    }

    public PayoutResponse toResponse(Payout payout) {
        AccountBank bank = payout.getAccountBank();
        return PayoutResponse.builder()
                .id(payout.getId())
                .amount(payout.getAmount())
                .status(payout.getStatus())
                .createdAt(payout.getCreatedAt())
                .bankName(bank == null || bank.getBank() == null ? null : bank.getBank().getShortName())
                .maskedAccountNumber(bank == null ? null : maskAccountNumber(bank.getAccountNumber()))
                .build();
    }

    private String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() <= 4)
            return accountNumber;
        return "*".repeat(accountNumber.length() - 4) + accountNumber.substring(accountNumber.length() - 4);
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
            } catch (Exception e) {
            }
        }
        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet addGiftRefund(Account account, BigDecimal amount, com.gnostica.core.model.Gift gift) {
        Wallet wallet = new Wallet();
        wallet.setAccount(account);
        wallet.setRemain(amount);
        wallet.setStatus(1);
        wallet.setType(5); // GIFT_REFUND
        wallet.setTargetType("GIFT");
        wallet.setAvailableAt(java.time.LocalDateTime.now());
        if (gift != null) {
            wallet.setTargetId(gift.getId());
        }
        return walletRepository.save(wallet);
    }

    @Transactional
    public Wallet addRefund(Account account, BigDecimal amount, com.gnostica.core.model.OrderDetail detail) {
        Wallet wallet = new Wallet();
        wallet.setAccount(account);
        wallet.setRemain(amount);
        wallet.setStatus(1);
        wallet.setType(6); // REFUND
        wallet.setTargetType("ORDER_DETAIL");
        wallet.setAvailableAt(java.time.LocalDateTime.now());
        if (detail != null) {
            wallet.setTargetId(detail.getId());
        }
        return walletRepository.save(wallet);
    }

    @Transactional
    public void voidEarningsForOrderDetails(java.util.Collection<java.util.UUID> detailIds) {
        if (detailIds == null || detailIds.isEmpty()) return;
        List<Wallet> earnings = walletRepository.findByTargetTypeAndTargetIdIn("ORDER_DETAIL", detailIds);
        for (Wallet w : earnings) {
            if (w.getStatus() != null && w.getStatus() == 1 && w.getType() != null && w.getType() == 1) { // active earning
                w.setStatus(0); // Locked/Voided
            }
        }
        walletRepository.saveAll(earnings);
    }

}
