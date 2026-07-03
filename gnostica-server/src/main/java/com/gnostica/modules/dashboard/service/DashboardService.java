package com.gnostica.modules.dashboard.service;
import com.gnostica.service.*;

import com.gnostica.modules.dashboard.dto.response.DashboardStatsResponse;
import com.gnostica.modules.dashboard.dto.response.MemberGrowthDTO;
import com.gnostica.modules.order.dto.response.RecentOrderDTO;
import com.gnostica.modules.dashboard.dto.response.RevenueMonthDTO;
import com.gnostica.modules.dashboard.dto.response.TopCourseDTO;
import java.util.List;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats();

    List<MemberGrowthDTO> getMemberGrowthData();

    List<RevenueMonthDTO> getRevenueData();

    List<RecentOrderDTO> getRecentOrders();

    List<TopCourseDTO> getTopCourses();
}
