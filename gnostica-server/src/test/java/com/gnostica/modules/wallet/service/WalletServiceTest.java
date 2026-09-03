package com.gnostica.modules.wallet.service;

import com.gnostica.core.constant.PayoutStatus;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.AccountBank;
import com.gnostica.core.model.Bank;
import com.gnostica.core.model.Payout;
import com.gnostica.core.model.Wallet;
import com.gnostica.core.repository.AccountBankRepository;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.BankRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.repository.WalletRepository;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.modules.wallet.dto.request.WithdrawRequest;
import com.gnostica.modules.wallet.dto.response.WalletOverviewResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class WalletServiceTest {
    @Mock private WalletRepository walletRepository;
    @Mock private PayoutRepository payoutRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private AccountBankRepository accountBankRepository;
    @Mock private BankRepository bankRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private OrderDetailRepository orderDetailRepository;
    @Mock private PayoutSecurityService payoutSecurityService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private PayoutSubmissionService payoutSubmissionService;

    @InjectMocks
    private WalletService walletService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("test@test.com");
    }

    @Test
    void testWithdraw_success() {
        Account account = new Account();
        account.setId(java.util.UUID.randomUUID());
        account.setStatus(1);
        
        when(accountRepository.findByEmail("test@test.com")).thenReturn(Optional.of(account));
        when(accountRepository.findByIdForUpdate(any())).thenReturn(Optional.of(account));
        
        Bank bank = new Bank();
        bank.setBin("970436");
        
        AccountBank accountBank = new AccountBank();
        accountBank.setBank(bank);
        accountBank.setAccountNumber("1234567890");
        accountBank.setPin(new BCryptPasswordEncoder().encode("123456"));
        when(accountBankRepository.findByAccountAndStatus(any(), eq(1))).thenReturn(Optional.of(accountBank));
        
        when(walletRepository.sumAvailableRemainByAccount(account)).thenReturn(new BigDecimal("100000"));
        when(payoutRepository.sumPayoutsByAccount(any(), any())).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumWalletPaymentsByAccount(account)).thenReturn(BigDecimal.ZERO);
        
        when(payoutRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            Payout p = invocation.getArgument(0);
            p.setId(java.util.UUID.randomUUID());
            return p;
        });
        
        when(payoutRepository.findById(any())).thenAnswer(invocation -> {
            Payout p = new Payout();
            p.setId(invocation.getArgument(0));
            return Optional.of(p);
        });
        
        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(50000L);
        request.setPin("123456");
        
        Payout payout = walletService.withdraw(request, "valid-idempotency-key-1234");
        
        assertNotNull(payout);
        verify(payoutSubmissionService).submit(any());
        verify(payoutRepository).saveAndFlush(any());
    }

    @Test
    void testWithdraw_aboveThreshold_requiresManualApprovalAndSkipsSubmit() {
        Account account = new Account();
        account.setId(java.util.UUID.randomUUID());
        account.setStatus(1);
        
        when(accountRepository.findByEmail("test@test.com")).thenReturn(Optional.of(account));
        when(accountRepository.findByIdForUpdate(any())).thenReturn(Optional.of(account));
        
        Bank bank = new Bank();
        bank.setBin("970436");
        
        AccountBank accountBank = new AccountBank();
        accountBank.setBank(bank);
        accountBank.setAccountNumber("1234567890");
        accountBank.setPin(new BCryptPasswordEncoder().encode("123456"));
        when(accountBankRepository.findByAccountAndStatus(any(), eq(1))).thenReturn(Optional.of(accountBank));
        
        when(walletRepository.sumAvailableRemainByAccount(account)).thenReturn(new BigDecimal("10000000"));
        when(payoutRepository.sumPayoutsByAccount(any(), any())).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumWalletPaymentsByAccount(account)).thenReturn(BigDecimal.ZERO);
        
        when(payoutRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            Payout p = invocation.getArgument(0);
            p.setId(java.util.UUID.randomUUID());
            return p;
        });
        
        when(payoutRepository.findById(any())).thenAnswer(invocation -> {
            Payout p = new Payout();
            p.setId(invocation.getArgument(0));
            return Optional.of(p);
        });
        
        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(5_000_000L);
        request.setPin("123456");
        
        Payout payout = walletService.withdraw(request, "valid-idempotency-key-1234");
        
        assertNotNull(payout);
        // Không submit lên cổng cho lệnh rút lớn, chỉ lưu AWAITING_APPROVAL chờ admin duyệt.
        verify(payoutSubmissionService, never()).submit(any());
        org.mockito.ArgumentCaptor<Payout> captor = org.mockito.ArgumentCaptor.forClass(Payout.class);
        verify(payoutRepository).saveAndFlush(captor.capture());
        assertEquals(Integer.valueOf(PayoutStatus.AWAITING_APPROVAL), captor.getValue().getStatus());
    }

    @Test
    void testGetMyWalletOverview_returnsRevenueBasedOnCoursePayments() {
        Account account = new Account();
        account.setId(java.util.UUID.randomUUID());
        account.setEmail("test@test.com");
        account.setStatus(1);

        when(accountRepository.findByEmail("test@test.com")).thenReturn(Optional.of(account));
        when(walletRepository.sumAvailableRemainByAccount(account)).thenReturn(new BigDecimal("500000"));
        when(payoutRepository.sumPayoutsByAccount(any(), any())).thenReturn(BigDecimal.ZERO);
        when(paymentRepository.sumWalletPaymentsByAccount(account)).thenReturn(BigDecimal.ZERO);
        when(walletRepository.sumPendingRevenueByAccount(account)).thenReturn(BigDecimal.ZERO);
        when(accountBankRepository.findByAccountAndStatus(any(), eq(1))).thenReturn(Optional.empty());

        when(orderDetailRepository.sumTotalRevenueByAccount(account)).thenReturn(1200000.0);
        when(orderDetailRepository.sumTotalInstructorEarningByAccount(account)).thenReturn(1080000.0);
        when(orderDetailRepository.sumInstructorEarningByAccountAndDateRange(eq(account), any(), any())).thenReturn(450000.0);

        WalletOverviewResponse overview = walletService.getMyWalletOverview();

        assertNotNull(overview);
        assertEquals(new BigDecimal("500000"), overview.getRemain());
        assertEquals(new BigDecimal("1200000.0"), overview.getTotalGrossRevenue());
        assertEquals(new BigDecimal("1080000.0"), overview.getTotalRevenue());
        assertEquals(new BigDecimal("1080000.0"), overview.getTotalNetRevenue());
        assertEquals(new BigDecimal("450000.0"), overview.getCurrentMonthRevenue());
    }
}
