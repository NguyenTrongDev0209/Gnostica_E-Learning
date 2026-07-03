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
    private Long newStudents;
    private Long activeCourses;
    private Long todayOrders;

    // Growth percentages (mocked for now or calculated in service)
    private Double revenueTrend; // e.g. 12.5
    private Double studentTrend; // e.g. 18.2
    private Double courseTrend; // e.g. 0.0
    private Double orderTrend; // e.g. -4.1
}
