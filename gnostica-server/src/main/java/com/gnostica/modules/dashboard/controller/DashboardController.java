package com.gnostica.modules.dashboard.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.dashboard.service.DashboardService;

import lombok.RequiredArgsConstructor;

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

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats(@RequestParam(required = false) String period) {
        try {
            return ApiResponse.success(dashboardService.getDashboardStats(period));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/member-growth")
    public ApiResponse<List<MemberGrowthDTO>> getMemberGrowth(@RequestParam(required = false) Integer months) {
        try {
            return ApiResponse.success(dashboardService.getMemberGrowthData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/revenue")
    public ApiResponse<List<RevenueMonthDTO>> getRevenue(@RequestParam(required = false) Integer months) {
        try {
            return ApiResponse.success(dashboardService.getRevenueData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/recent-orders")
    public ApiResponse<List<RecentOrderDTO>> getRecentOrders() {
        try {
            return ApiResponse.success(dashboardService.getRecentOrders());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/top-courses")
    public ApiResponse<List<TopCourseDTO>> getTopCourses() {
        try {
            return ApiResponse.success(dashboardService.getTopCourses());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/top-instructors")
    public ApiResponse<List<TopInstructorDTO>> getTopInstructors(@RequestParam(required = false) String period) {
        try {
            return ApiResponse.success(dashboardService.getTopInstructors(period));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/student-productivity")
    public ApiResponse<StudentProductivityDTO> getStudentProductivity(@RequestParam(required = false) String period) {
        try {
            return ApiResponse.success(dashboardService.getStudentProductivity(period));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/user-demographics")
    public ApiResponse<UserAgeDistributionDTO> getUserDemographics() {
        try {
            return ApiResponse.success(dashboardService.getUserAgeDistribution());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/user-ratings")
    public ApiResponse<List<MonthlyUserRatingDTO>> getUserRatings(@RequestParam(required = false) Integer months) {
        try {
            return ApiResponse.success(dashboardService.getUserRatingsData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/violations")
    public ApiResponse<List<MonthlyViolationDTO>> getViolations(@RequestParam(required = false) Integer months) {
        try {
            return ApiResponse.success(dashboardService.getViolationsData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }
}

