package com.gnostica.modules.wallet.service;

import com.gnostica.core.constant.PayoutStatus;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Payout;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.constant.PayoutMetadataKeys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PayoutAdminServiceTest {

    @Mock private PayoutRepository payoutRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private PayoutSubmissionService payoutSubmissionService;

    @InjectMocks
    private PayoutAdminService payoutAdminService;

    private Payout payout;
    private Account admin;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin@test.com");

        admin = new Account();
        admin.setId(UUID.randomUUID());
        when(accountRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(admin));

        payout = new Payout();
        payout.setId(UUID.randomUUID());
        payout.setStatus(PayoutStatus.AWAITING_APPROVAL);
    }

    @Test
    void testApprove_transitionsToPendingAndSubmits() {
        when(payoutRepository.findByIdForUpdate(payout.getId())).thenReturn(Optional.of(payout));
        when(payoutRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(payoutRepository.findById(payout.getId())).thenReturn(Optional.of(payout));

        Payout result = payoutAdminService.approve(payout.getId());

        assertEquals(PayoutStatus.PENDING, result.getStatus());
        assertEquals(admin.getId().toString(), result.getMetadata().get(PayoutMetadataKeys.APPROVED_BY));
        assertNotNull(result.getMetadata().get(PayoutMetadataKeys.APPROVED_AT));
        assertNull(result.getMetadata().get(PayoutMetadataKeys.REJECTION_REASON));
        verify(payoutSubmissionService).submit(payout.getId());
    }

    @Test
    void testReject_transitionsToRejectedWithReason() {
        when(payoutRepository.findByIdForUpdate(payout.getId())).thenReturn(Optional.of(payout));
        when(payoutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Payout result = payoutAdminService.reject(payout.getId(), "Sai thông tin ngân hàng");

        assertEquals(PayoutStatus.REJECTED, result.getStatus());
        assertEquals("Sai thông tin ngân hàng", result.getMetadata().get(PayoutMetadataKeys.REJECTION_REASON));
        verify(payoutSubmissionService, never()).submit(any());
    }

    @Test
    void testApprove_throwsForNonAwaitingPayout() {
        payout.setStatus(PayoutStatus.PENDING);
        when(payoutRepository.findByIdForUpdate(payout.getId())).thenReturn(Optional.of(payout));

        assertThrows(RuntimeException.class, () -> payoutAdminService.approve(payout.getId()));
        verify(payoutSubmissionService, never()).submit(any());
    }

    @Test
    void testReject_throwsForMissingPayout() {
        when(payoutRepository.findByIdForUpdate(any())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> payoutAdminService.reject(UUID.randomUUID(), "Lý do"));
    }
}
