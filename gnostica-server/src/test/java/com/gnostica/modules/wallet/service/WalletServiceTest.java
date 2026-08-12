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
import com.gnostica.modules.wallet.dto.request.WithdrawRequest;
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
}
