package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPayoutDTO {
    private UUID payoutId;
    private String bankInfo;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private Integer status;
}
