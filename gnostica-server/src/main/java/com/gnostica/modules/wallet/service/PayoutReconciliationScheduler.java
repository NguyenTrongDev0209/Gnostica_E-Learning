package com.gnostica.modules.wallet.service;

import com.gnostica.core.constant.PayoutStatus;
import com.gnostica.core.model.Payout;
import com.gnostica.core.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Keeps the local payout ledger aligned with the payout gateway. */
@Component
@RequiredArgsConstructor
@Slf4j
public class PayoutReconciliationScheduler {

    private final PayoutRepository payoutRepository;
    private final PayoutsService payoutsService;

    @Scheduled(fixedDelayString = "${payos.payout-reconciliation-interval-ms:60000}")
    public void reconcilePendingPayouts() {
        List<Payout> payouts = payoutRepository.findByStatusIn(
                List.of(PayoutStatus.PENDING, PayoutStatus.PROCESSING));
        for (Payout payout : payouts) {
            if (payout.getGatewayPayoutId() == null || payout.getGatewayPayoutId().isBlank()) {
                log.warn("Payout {} has no gateway id and requires manual review", payout.getId());
                continue;
            }
            try {
                reconcile(payout.getId());
            } catch (Exception exception) {
                log.warn("Unable to reconcile payout {}: {}", payout.getId(), exception.getMessage());
            }
        }
    }

    @Transactional
    public void reconcile(java.util.UUID payoutId) throws Exception {
        Payout local = payoutRepository.findById(payoutId).orElse(null);
        if (local == null || (local.getStatus() != PayoutStatus.PENDING
                && local.getStatus() != PayoutStatus.PROCESSING)) {
            return;
        }

        vn.payos.model.v1.payouts.Payout remote = payoutsService.retrievePayout(local.getGatewayPayoutId());
        int nextStatus = mapStatus(remote.getApprovalState());
        if (nextStatus != local.getStatus()) {
            local.setStatus(nextStatus);
            payoutRepository.save(local);
            log.info("Payout {} reconciled to status {}", local.getId(), nextStatus);
        }
    }

    private int mapStatus(vn.payos.model.v1.payouts.PayoutApprovalState state) {
        if (state == null) return PayoutStatus.PENDING;
        return switch (state) {
            case COMPLETED -> PayoutStatus.COMPLETED;
            case FAILED -> PayoutStatus.FAILED;
            case REJECTED, CANCELLED -> PayoutStatus.REJECTED;
            // A partial payout must stay reserved until staff reconciles the
            // actual transferred amount; releasing it would permit overspending.
            case PROCESSING, PARTIAL_COMPLETED -> PayoutStatus.PROCESSING;
            default -> PayoutStatus.PENDING;
        };
    }
}
