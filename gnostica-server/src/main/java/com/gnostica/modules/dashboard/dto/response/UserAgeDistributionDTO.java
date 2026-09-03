package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAgeDistributionDTO {
    private Long age18_24;
    private Long age25_34;
    private Long age35_44;
    private Long age45plus;
}
