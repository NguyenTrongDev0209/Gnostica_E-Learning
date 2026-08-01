package com.gnostica.modules.wallet.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletOverviewResponse {
    private UUID accountId;
    private BigDecimal remain;
    private BigDecimal totalRevenue;
    private BigDecimal currentMonthRevenue;
    private BigDecimal pendingRevenue;
    private Integer type;
    private Integer status;
    private long withdrawalsToday;
    private String accountNumber;
    private String bankBin;
    private String bankName;
}
