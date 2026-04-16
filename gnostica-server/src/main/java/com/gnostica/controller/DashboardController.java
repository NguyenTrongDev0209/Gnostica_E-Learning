package com.gnostica.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.dto.response.ApiResponse;
import com.gnostica.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        try {
            return ApiResponse.success(dashboardService.getDashboardStats());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/member-growth")
    public ApiResponse<List<Map<String, Object>>> getMemberGrowth() {
        try {
            return ApiResponse.success(dashboardService.getMemberGrowthData());
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }
}
