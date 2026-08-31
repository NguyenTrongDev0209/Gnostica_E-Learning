package com.gnostica.modules.dashboard.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.dashboard.service.DashboardService;
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

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    private LocalDateTime parseDate(String str, boolean isEnd) {
        if (str == null || str.isBlank()) return null;
        try {
            if (str.length() == 10) { // yyyy-MM-dd
                LocalDate ld = LocalDate.parse(str);
                return isEnd ? ld.atTime(23, 59, 59, 999999999) : ld.atStartOfDay();
            }
            return LocalDateTime.parse(str);
        } catch (Exception e) {
            try {
                return java.time.ZonedDateTime.parse(str).toLocalDateTime();
            } catch (Exception e2) {
                return null;
            }
        }
    }

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
    public ApiResponse<List<MemberGrowthDTO>> getMemberGrowth(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer months) {
        try {
            LocalDateTime startDt = parseDate(start, false);
            LocalDateTime endDt = parseDate(end, true);
            if (startDt != null || endDt != null) {
                return ApiResponse.success(dashboardService.getMemberGrowthData(startDt, endDt));
            }
            return ApiResponse.success(dashboardService.getMemberGrowthData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/revenue")
    public ApiResponse<List<RevenueMonthDTO>> getRevenue(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer months) {
        try {
            LocalDateTime startDt = parseDate(start, false);
            LocalDateTime endDt = parseDate(end, true);
            if (startDt != null || endDt != null) {
                return ApiResponse.success(dashboardService.getRevenueData(startDt, endDt));
            }
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
    public ApiResponse<List<MonthlyUserRatingDTO>> getUserRatings(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer months) {
        try {
            LocalDateTime startDt = parseDate(start, false);
            LocalDateTime endDt = parseDate(end, true);
            if (startDt != null || endDt != null) {
                return ApiResponse.success(dashboardService.getUserRatingsData(startDt, endDt));
            }
            return ApiResponse.success(dashboardService.getUserRatingsData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/violations")
    public ApiResponse<List<MonthlyViolationDTO>> getViolations(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Integer months) {
        try {
            LocalDateTime startDt = parseDate(start, false);
            LocalDateTime endDt = parseDate(end, true);
            if (startDt != null || endDt != null) {
                return ApiResponse.success(dashboardService.getViolationsData(startDt, endDt));
            }
            return ApiResponse.success(dashboardService.getViolationsData(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }
}

