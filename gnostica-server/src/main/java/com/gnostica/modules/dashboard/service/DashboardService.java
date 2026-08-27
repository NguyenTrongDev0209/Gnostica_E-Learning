package com.gnostica.modules.dashboard.service;

import com.gnostica.modules.dashboard.dto.response.DashboardStatsResponse;
import com.gnostica.modules.dashboard.dto.response.MemberGrowthDTO;
import com.gnostica.modules.dashboard.dto.response.MonthlyUserRatingDTO;
import com.gnostica.modules.dashboard.dto.response.MonthlyViolationDTO;
import com.gnostica.modules.checkout.dto.response.RecentOrderDTO;
import com.gnostica.modules.dashboard.dto.response.RevenueMonthDTO;
import com.gnostica.modules.dashboard.dto.response.StudentProductivityDTO;
import com.gnostica.modules.dashboard.dto.response.TopCourseDTO;
import com.gnostica.modules.dashboard.dto.response.TopInstructorDTO;
import com.gnostica.modules.dashboard.dto.response.UserAgeDistributionDTO;
import java.util.List;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats(String period);

    List<MemberGrowthDTO> getMemberGrowthData(Integer months);

    List<RevenueMonthDTO> getRevenueData(Integer months);

    List<RecentOrderDTO> getRecentOrders();

    List<TopCourseDTO> getTopCourses();

    List<TopInstructorDTO> getTopInstructors(String period);

    StudentProductivityDTO getStudentProductivity(String period);

    UserAgeDistributionDTO getUserAgeDistribution();

    List<MonthlyUserRatingDTO> getUserRatingsData(Integer months);

    List<MonthlyViolationDTO> getViolationsData(Integer months);
}


