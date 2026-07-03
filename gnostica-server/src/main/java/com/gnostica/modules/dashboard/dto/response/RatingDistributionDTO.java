package com.gnostica.modules.dashboard.dto.response;
import com.gnostica.service.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingDistributionDTO {
    private String name;
    private Integer value;
    private String color;
}
