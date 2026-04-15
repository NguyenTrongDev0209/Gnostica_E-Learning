package com.gnostica.controller;

import com.gnostica.model.Bank;
import com.gnostica.service.BankService;
import com.gnostica.service.BankSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banks")
public class BankController {

    private final BankService bankService;
    private final BankSyncService bankSyncService;

    public BankController(BankService bankService, BankSyncService bankSyncService) {
        this.bankService = bankService;
        this.bankSyncService = bankSyncService;
    }

    @GetMapping
    public ResponseEntity<List<Bank>> getAllBanks() {
        return ResponseEntity.ok(bankService.getAllBanks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bank> getBankById(@PathVariable Long id) {
        return bankService.getBankById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Bank> createBank(@RequestBody Bank bank) {
        return ResponseEntity.ok(bankService.saveBank(bank));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bank> updateBank(@PathVariable Long id, @RequestBody Bank bankDetails) {
        return bankService.updateBank(id, bankDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBank(@PathVariable Long id) {
        if (bankService.deleteBank(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
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
