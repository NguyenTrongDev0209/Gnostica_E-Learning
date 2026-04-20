package com.gnostica.service;

import com.gnostica.dto.response.DashboardStatsResponse;
import com.gnostica.dto.response.MemberGrowthDTO;
import com.gnostica.dto.response.RecentOrderDTO;
import com.gnostica.dto.response.RevenueMonthDTO;
import com.gnostica.dto.response.TopCourseDTO;
import java.util.List;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats();

    List<MemberGrowthDTO> getMemberGrowthData();

    List<RevenueMonthDTO> getRevenueData();

    List<RecentOrderDTO> getRecentOrders();

    List<TopCourseDTO> getTopCourses();
}
