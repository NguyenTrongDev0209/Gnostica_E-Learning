package com.gnostica.modules.wallet.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class WalletTransactionResponse {
    private UUID id;
    private String category; // EARNING, WITHDRAWAL, REFUND, DEPOSIT, GIFT_REFUND
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private String reference;
    private String bankName;
    private String maskedAccountNumber;
    private String status;
}
