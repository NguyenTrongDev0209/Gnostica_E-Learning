package com.gnostica.controller;

import com.gnostica.service.BankSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/banks")
public class BankSyncController {

    private final BankSyncService bankSyncService;

    public BankSyncController(BankSyncService bankSyncService) {
        this.bankSyncService = bankSyncService;
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncBanks() {
        try {
            bankSyncService.syncBanksData();
            return ResponseEntity.ok("Đồng bộ dữ liệu ngân hàng thành công!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi trong quá trình đồng bộ: " + e.getMessage());
        }
    }
}
