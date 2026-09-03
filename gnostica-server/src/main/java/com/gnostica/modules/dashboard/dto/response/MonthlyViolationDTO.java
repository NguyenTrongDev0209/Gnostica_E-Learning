package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyViolationDTO {
    private String label;
    private Long violations;

    public String getMonth() {
        return label;
    }
}
