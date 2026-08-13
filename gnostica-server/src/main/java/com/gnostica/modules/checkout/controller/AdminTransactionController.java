package com.gnostica.modules.checkout.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.checkout.dto.response.AdminTransactionResponse;
import com.gnostica.modules.checkout.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminTransactionController {

    private final AdminTransactionService transactionService;

    @GetMapping
    public ApiResponse<List<AdminTransactionResponse>> getAllTransactions(
            @RequestParam(defaultValue = "payments") String module) {
        return ApiResponse.success(transactionService.getTransactions(module));
    }
}
