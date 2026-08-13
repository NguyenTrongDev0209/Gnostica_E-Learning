package com.gnostica.modules.checkout.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.core.model.Account;
import com.gnostica.modules.checkout.dto.request.RefundRequest;
import com.gnostica.modules.checkout.dto.request.RejectRefundRequest;
import com.gnostica.modules.checkout.dto.response.RefundResponse;
import com.gnostica.modules.checkout.service.RefundService;
import com.gnostica.modules.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkout/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;
    private final WalletService walletService; // for getCurrentAccount()

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<RefundResponse>> requestRefund(@Valid @RequestBody RefundRequest req) {
        try {
            Account account = walletService.getCurrentAccount();
            RefundResponse response = refundService.requestRefund(account, req);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<RefundResponse>>> getMyRefunds() {
        try {
            Account account = walletService.getCurrentAccount();
            List<RefundResponse> responses = refundService.getMyRefunds(account);
            return ResponseEntity.ok(ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<Object>> getAllRefunds(
            @RequestParam(required = false) List<Integer> status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            org.springframework.data.domain.Page<RefundResponse> responses = refundService.getAllRefundsPaged(status, pageable);
            return ResponseEntity.ok(ApiResponse.success(responses));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<String>> approveRefund(@PathVariable UUID id) {
        try {
            refundService.approveRefund(id);
            return ResponseEntity.ok(ApiResponse.success("Đã duyệt yêu cầu hoàn tiền thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<String>> rejectRefund(@PathVariable UUID id, @Valid @RequestBody RejectRefundRequest req) {
        try {
            refundService.rejectRefund(id, req.getReason());
            return ResponseEntity.ok(ApiResponse.success("Đã từ chối yêu cầu hoàn tiền"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
