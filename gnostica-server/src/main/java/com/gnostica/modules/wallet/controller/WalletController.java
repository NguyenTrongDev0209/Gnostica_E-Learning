package com.gnostica.modules.wallet.controller;
import com.gnostica.modules.wallet.service.*;
import com.gnostica.modules.wallet.dto.response.*;

import com.gnostica.modules.wallet.dto.request.SetBankAccountRequest;
import com.gnostica.modules.wallet.dto.request.WithdrawRequest;
import com.gnostica.core.model.AccountBank;
import com.gnostica.core.model.Payout;
import com.gnostica.core.constant.PayoutStatus;
import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.modules.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;
    private final PayoutSubmissionService payoutSubmissionService;
    private final PayoutRepository payoutRepository;

    @GetMapping("/me")
    public ResponseEntity<WalletOverviewResponse> getMyWallet() {
        return ResponseEntity.ok(walletService.getMyWalletOverview());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PayoutResponse>> getMyTransactions() {
        return ResponseEntity.ok(walletService.getMyTransactions());
    }

    @GetMapping("/history")
    public ResponseEntity<List<WalletTransactionResponse>> getMyTransactionHistory() {
        return ResponseEntity.ok(walletService.getMyTransactionHistory());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getWalletStats() {
        WalletOverviewResponse wallet = walletService.getMyWalletOverview();
        List<WalletTransactionResponse> history = walletService.getMyTransactionHistory();

        Map<String, Object> stats = new HashMap<>();
        stats.put("balance", wallet.getRemain());
        stats.put("totalRevenue", wallet.getTotalRevenue());
        stats.put("currentMonthRevenue", wallet.getCurrentMonthRevenue());
        stats.put("pendingRevenue", wallet.getPendingRevenue());
        stats.put("transactionCount", history.size());

        return ResponseEntity.ok(stats);
    }

    /**
     * Thiết lập tài khoản ngân hàng (lần đầu hoặc sau khi xóa)
     */
    @PostMapping("/bank-account")
    public ResponseEntity<?> setBankAccount(@RequestBody SetBankAccountRequest request) {
        try {
            AccountBank accountBank = walletService.setBankAccount(request);
            return ResponseEntity.ok(Map.of("message", "Thiết lập tài khoản ngân hàng thành công", "accountBank", accountBank));
        } catch (DataIntegrityViolationException e) {
            // Không đưa chi tiết câu lệnh SQL hoặc unique constraint ra giao diện.
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Tài khoản ngân hàng này đã tồn tại. Vui lòng kiểm tra lại hoặc thử lại."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Không thể lưu tài khoản ngân hàng. Vui lòng thử lại."));
        }
    }

    /**
     * Xóa tài khoản ngân hàng (yêu cầu xác minh PIN)
     */
    @DeleteMapping("/bank-account")
    public ResponseEntity<?> removeBankAccount(@RequestBody Map<String, String> body) {
        try {
            String pin = body.get("pin");
            walletService.removeBankAccount(pin);
            return ResponseEntity.ok(Map.of("message", "Đã xóa tài khoản ngân hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống"));
        }
    }

    /**
     * Rút tiền — dùng bank đã lưu, xác thực PIN
     */
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody WithdrawRequest request) {
        try {
            Payout payout = walletService.withdraw(request, idempotencyKey);
            
            if (payout.getStatus() == PayoutStatus.FAILED) {
                return ResponseEntity.badRequest().body(Map.of("message", "Hệ thống đang gặp sự cố. Giao dịch bị từ chối."));
            }
            
            return ResponseEntity.ok(Map.of("message", "Lệnh rút tiền đã khởi tạo thành công", "payout", walletService.toResponse(payout)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống: Không thể xử lý yêu cầu"));
        }
    }
}
