package com.gnostica.modules.wallet.service;

import com.gnostica.core.constant.PayoutStatus;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Payout;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.constant.PayoutMetadataKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Duyệt/từ chối thủ công các lệnh rút tiền lớn (>= 5.000.000đ).
 * Lệnh ở trạng thái AWAITING_APPROVAL sẽ không bao giờ được submit lên cổng
 * cho tới khi admin duyệt (chuyển sang PENDING rồi submit qua PayoutSubmissionService).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutAdminService {

    private final PayoutRepository payoutRepository;
    private final AccountRepository accountRepository;
    private final PayoutSubmissionService payoutSubmissionService;

    /**
     * Admin duyệt lệnh rút tiền lớn: AWAITING_APPROVAL -> PENDING rồi submit lên cổng.
     */
    @Transactional(rollbackFor = Exception.class)
    public Payout approve(UUID payoutId) {
        Payout payout = findAwaiting(payoutId);
        Account admin = getCurrentAdmin();

        payout.getMetadata().put(PayoutMetadataKeys.APPROVED_BY, admin.getId().toString());
        payout.getMetadata().put(PayoutMetadataKeys.APPROVED_AT, LocalDateTime.now().toString());
        payout.getMetadata().remove(PayoutMetadataKeys.REJECTION_REASON);
        payout.setStatus(PayoutStatus.PENDING);
        payout = payoutRepository.saveAndFlush(payout);

        payoutSubmissionService.submit(payout.getId());
        log.info("Payout {} approved by admin {} -> submitted to gateway", payout.getId(), admin.getId());
        return payoutRepository.findById(payout.getId()).orElse(payout);
    }

    /**
     * Admin từ chối lệnh rút tiền lớn: AWAITING_APPROVAL -> REJECTED, giải phóng số dư.
     */
    @Transactional
    public Payout reject(UUID payoutId, String reason) {
        Payout payout = findAwaiting(payoutId);
        payout.setStatus(PayoutStatus.REJECTED);
        if (reason != null && !reason.isBlank()) {
            payout.getMetadata().put(PayoutMetadataKeys.REJECTION_REASON, truncate(reason));
        } else {
            payout.getMetadata().remove(PayoutMetadataKeys.REJECTION_REASON);
        }
        payout = payoutRepository.save(payout);
        log.info("Payout {} rejected by admin", payout.getId());
        return payout;
    }

    private Payout findAwaiting(UUID payoutId) {
        Payout payout = payoutRepository.findByIdForUpdate(payoutId)
                .orElseThrow(() -> new RuntimeException("Lệnh rút tiền không tồn tại."));
        if (payout.getStatus() != PayoutStatus.AWAITING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể thao tác với lệnh rút tiền đang chờ admin duyệt.");
        }
        return payout;
    }

    private Account getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        return accountRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    private String truncate(String value) {
        return value.length() <= 500 ? value : value.substring(0, 500);
    }
}
