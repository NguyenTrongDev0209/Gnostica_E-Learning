package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorDashboardStatsDTO {
    private Double monthRevenue;
    private Double revenueTrend;
    private Long newStudents;
    private Double studentTrend;
    private Double averageRating;
    private Double ratingTrend;
    private Double completionRate;
    private Double completionTrend;
}
