package com.gnostica.modules.adminstats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendPointDTO {
    private String month; // Format: "MM/YYYY" or similar
    private long total;
    private double amount; // For financial trends (Refunds, Withdrawals)
    
    // How many tickets/reports had status X in this month
    private Map<String, Long> statusCounts; 
}
