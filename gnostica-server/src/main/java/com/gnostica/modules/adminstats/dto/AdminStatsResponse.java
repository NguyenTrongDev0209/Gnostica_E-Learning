package com.gnostica.modules.adminstats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private List<TrendPointDTO> trends;
    private List<KeyCountDTO> statusDistribution;
    
    // For specific tabs
    private List<KeyCountDTO> typeDistribution;
    private List<KeyCountDTO> priorityDistribution;
    
    // Summary values
    private long totalRecords;
    private double totalAmount;
}
