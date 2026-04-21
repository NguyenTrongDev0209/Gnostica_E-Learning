package com.gnostica.controller;

import com.gnostica.dto.SetBankAccountRequest;
import com.gnostica.dto.WithdrawRequest;
import com.gnostica.model.Wallet;
import com.gnostica.model.Transaction;
import com.gnostica.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import vn.payos.model.v1.payouts.Payout;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;

    @GetMapping("/me")
    public ResponseEntity<Wallet> getMyWallet() {
        return ResponseEntity.ok(walletService.getMyWallet());
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getMyTransactions() {
        return ResponseEntity.ok(walletService.getMyTransactions());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getWalletStats() {
        Wallet wallet = walletService.getMyWallet();
        List<Transaction> transactions = walletService.getMyTransactions();

        double totalRevenue = transactions.stream()
                .filter(t -> t.getType() == 1 && "REVENUE".equals(t.getPaymentMethod()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("balance", wallet.getRemain());
        stats.put("totalRevenue", totalRevenue);
        stats.put("transactionCount", transactions.size());

        return ResponseEntity.ok(stats);
    }

    /**
     * Thiết lập tài khoản ngân hàng (lần đầu hoặc sau khi xóa)
     */
    @PostMapping("/bank-account")
    public ResponseEntity<?> setBankAccount(@RequestBody SetBankAccountRequest request) {
        try {
            Wallet wallet = walletService.setBankAccount(request);
            return ResponseEntity.ok(Map.of("message", "Thiết lập tài khoản ngân hàng thành công", "wallet", wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống"));
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
    public ResponseEntity<?> withdraw(@RequestBody WithdrawRequest request) {
        try {
            Payout payout = walletService.withdraw(request);
            return ResponseEntity.ok(Map.of("message", "Lệnh rút tiền đã khởi tạo thành công", "payout", payout));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Lỗi hệ thống: Không thể xử lý yêu cầu"));
        }
    }
}
