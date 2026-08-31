package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundMonthDTO {
    private String label;
    private Double refundedAmount;
    private Long approvedCount;
    private Long rejectedCount;
    private Long pendingCount;
    private Long totalRequests;

    public String getMonth() {
        return label;
    }
}
