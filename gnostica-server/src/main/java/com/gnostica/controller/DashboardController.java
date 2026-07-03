package com.gnostica.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.service.DashboardService;

import lombok.RequiredArgsConstructor;

import com.gnostica.dto.response.DashboardStatsResponse;
import com.gnostica.dto.response.MemberGrowthDTO;
import com.gnostica.modules.order.dto.response.RecentOrderDTO;
import com.gnostica.dto.response.RevenueMonthDTO;
import com.gnostica.dto.response.TopCourseDTO;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsResponse> getStats() {
        try {
            return ApiResponse.success(dashboardService.getDashboardStats());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/member-growth")
    public ApiResponse<List<MemberGrowthDTO>> getMemberGrowth() {
        try {
            return ApiResponse.success(dashboardService.getMemberGrowthData());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/revenue")
    public ApiResponse<List<RevenueMonthDTO>> getRevenue() {
        try {
            return ApiResponse.success(dashboardService.getRevenueData());
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
}
