package com.gnostica.modules.wallet.service;

import com.gnostica.core.constant.PayoutStatus;
import com.gnostica.core.model.Payout;
import com.gnostica.core.repository.PayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v1.payouts.PayoutRequests;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Submits an already committed payout intent to PayOS using one immutable reference id. */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutSubmissionService {
    private final PayoutRepository payoutRepository;
    private final PayoutsService payoutsService;

    @Transactional
    public void submit(UUID payoutId) {
        Payout payout = payoutRepository.findByIdForUpdate(payoutId).orElse(null);
        if (payout == null || payout.getStatus() != PayoutStatus.PENDING || payout.getGatewayPayoutId() != null) {
            return;
        }

        try {
            // Resolve an ambiguous previous request before ever sending another create call.
            vn.payos.model.v1.payouts.Payout remote = findByReference(payout.getGatewayReferenceId());
            if (remote == null) {
                PayoutRequests request = new PayoutRequests();
                request.setAmount(payout.getAmount().longValueExact());
                request.setToBin(payout.getAccountBank().getBank().getBin());
                request.setToAccountNumber(payout.getAccountBank().getAccountNumber());
                request.setDescription(descriptionFor(payout));
                request.setReferenceId(payout.getGatewayReferenceId());
                remote = payoutsService.createPayout(request);
            }

            payout.setGatewayPayoutId(remote.getId());
            if (remote.getReferenceId() != null && !remote.getReferenceId().isBlank()) {
                payout.setGatewayReferenceId(remote.getReferenceId());
            }
            payout.setStatus(toLocalStatus(remote.getApprovalState()));
            payout.setLastSubmissionError(null);
        } catch (Exception exception) {
            payout.setSubmissionAttempts((payout.getSubmissionAttempts() == null ? 0 : payout.getSubmissionAttempts()) + 1);
            String errorMsg = exception.getMessage();
            payout.setLastSubmissionError(truncate(errorMsg));
            log.warn("Unable to submit payout {} (attempt {}): {}", payoutId, payout.getSubmissionAttempts(), errorMsg);
            
            boolean isDefinitiveError = errorMsg != null && errorMsg.contains("\"code\"") && errorMsg.contains("\"desc\"");
            if (isDefinitiveError || payout.getSubmissionAttempts() >= 3) {
                log.error("Failing payout {} (definitive: {}, attempts: {})", payoutId, isDefinitiveError, payout.getSubmissionAttempts());
                payout.setStatus(PayoutStatus.FAILED);
            }
        }
        payout.setLastSubmissionAt(LocalDateTime.now());
        payoutRepository.save(payout);
    }

    private vn.payos.model.v1.payouts.Payout findByReference(String referenceId) throws Exception {
        List<vn.payos.model.v1.payouts.Payout> payouts = payoutsService.retrievePayoutList(
                referenceId, null, null, null, null, 1, 0);
        return payouts.isEmpty() ? null : payouts.get(0);
    }

    private String descriptionFor(Payout payout) {
        String description = "Rut tien " + payout.getAccount().getFullName();
        return description.length() > 25 ? description.substring(0, 25) : description;
    }

    private int toLocalStatus(vn.payos.model.v1.payouts.PayoutApprovalState state) {
        if (state == null) return PayoutStatus.PENDING;
        return switch (state) {
            case COMPLETED -> PayoutStatus.COMPLETED;
            case FAILED -> PayoutStatus.FAILED;
            case REJECTED, CANCELLED -> PayoutStatus.REJECTED;
            case PROCESSING, PARTIAL_COMPLETED -> PayoutStatus.PROCESSING;
            default -> PayoutStatus.PENDING;
        };
    }

    private String truncate(String value) {
        if (value == null) return "Unknown payout gateway error";
        return value.length() <= 500 ? value : value.substring(0, 500);
    }
}
