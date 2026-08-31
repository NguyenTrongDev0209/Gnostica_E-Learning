package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Double totalRevenue;
    private Double instructorRevenue;
    private Long newStudents;
    private Long activeCourses;
    private Long todayOrders;

    // Platform Overview metrics
    private Long totalCourses;
    private Long totalCategories;
    private Long totalUsers;
    private Long totalInstructors;

    // Refund metrics
    private Double totalRefunded;
    private Long totalRefunds;
    private Long pendingRefunds;

    // Growth percentages
    private Double revenueTrend; // e.g. 12.5
    private Double instructorRevenueTrend; // e.g. 8.0
    private Double studentTrend; // e.g. 18.2
    private Double courseTrend; // e.g. 0.0
    private Double orderTrend; // e.g. -4.1
}
