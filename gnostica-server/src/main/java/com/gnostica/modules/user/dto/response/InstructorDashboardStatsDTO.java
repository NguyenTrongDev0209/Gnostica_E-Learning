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
    private Double monthNetRevenue;
    private Double revenueTrend;
    private Long newStudents;
    private Double studentTrend;
    private Double averageRating;
    private Double ratingTrend;
    private Long ratingCount;
    private Double completionRate;
    private Double completionTrend;
    private Double refundRate;
    private Long totalCourses;
    private Long totalStudents;
}
