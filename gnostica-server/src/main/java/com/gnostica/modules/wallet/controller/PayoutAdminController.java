package com.gnostica.modules.wallet.controller;

import com.gnostica.core.model.Payout;
import com.gnostica.modules.wallet.service.PayoutAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Admin duyệt/từ chối lệnh rút tiền lớn (>= 5.000.000đ) đang ở trạng thái AWAITING_APPROVAL.
 */
@RestController
@RequestMapping("/api/admin/payouts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class PayoutAdminController {

    private final PayoutAdminService payoutAdminService;
    private final com.gnostica.modules.checkout.service.AdminTransactionService adminTransactionService;

    @GetMapping
    public ResponseEntity<com.gnostica.core.dto.response.ApiResponse<org.springframework.data.domain.Page<com.gnostica.modules.checkout.dto.response.AdminTransactionResponse>>> getPayouts(
            @RequestParam(required = false) java.util.List<Integer> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            org.springframework.data.domain.Page<com.gnostica.modules.checkout.dto.response.AdminTransactionResponse> responses = adminTransactionService.getWithdrawalsPaged(status, pageable);
            return ResponseEntity.ok(com.gnostica.core.dto.response.ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(com.gnostica.core.dto.response.ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{payoutId}/approve")
    public ResponseEntity<?> approve(@PathVariable UUID payoutId) {
        try {
            Payout payout = payoutAdminService.approve(payoutId);
            return ResponseEntity.ok(Map.of(
                    "message", "Đã duyệt lệnh rút tiền. Hệ thống đang tiến hành chuyển khoản.",
                    "payoutId", payout.getId().toString(),
                    "status", payout.getStatus()));
        } catch (Exception e) {
            log.error("Error approving payout {}", payoutId, e);
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Không thể duyệt lệnh rút tiền."));
        }
    }

    @PostMapping("/{payoutId}/reject")
    public ResponseEntity<?> reject(@PathVariable UUID payoutId,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            Payout payout = payoutAdminService.reject(payoutId, reason);
            return ResponseEntity.ok(Map.of(
                    "message", "Đã từ chối lệnh rút tiền.",
                    "payoutId", payout.getId().toString(),
                    "status", payout.getStatus()));
        } catch (Exception e) {
            log.error("Error rejecting payout {}", payoutId, e);
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Không thể từ chối lệnh rút tiền."));
        }
    }
}
