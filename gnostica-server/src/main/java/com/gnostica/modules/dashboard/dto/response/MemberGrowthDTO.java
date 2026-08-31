package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberGrowthDTO {
    private String label;
    private Long students;
    private Long instructors;

    public String getMonth() {
        return label;
    }
}
