package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSummaryDTO {
    private BigDecimal totalSpent;
    private BigDecimal totalRevenue;
    private int courseCount;
    private BigDecimal balance;
}
