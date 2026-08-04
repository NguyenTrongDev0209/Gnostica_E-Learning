package com.gnostica.modules.wallet.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/** Safe payout projection for the instructor UI; never exposes PIN hashes or full bank details. */
@Data
@Builder
public class PayoutResponse {
    private UUID id;
    private BigDecimal amount;
    private Integer status;
    private LocalDateTime createdAt;
    private String bankName;
    private String maskedAccountNumber;
}
