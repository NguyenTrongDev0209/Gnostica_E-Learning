package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyUserRatingDTO {
    private String month;
    private Long star1;
    private Long star2;
    private Long star3;
    private Long star4;
    private Long star5;
    private Long total;
}
