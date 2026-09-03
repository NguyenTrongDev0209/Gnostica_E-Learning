package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueMonthDTO {
    private String label;
    private Double revenue;
    private Double instructorRevenue;
    private Double platformRevenue;
    private Double withdrawable;
    private Long orders;

    public String getMonth() {
        return label;
    }
}
