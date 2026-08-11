package com.gnostica.modules.adminstats;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.adminstats.dto.AdminStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    @GetMapping("/supports")
    public ApiResponse<AdminStatsResponse> getSupportsStats(@RequestParam(defaultValue = "12") int months) {
        try {
            return ApiResponse.success(adminStatsService.getSupportsStats(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/refunds")
    public ApiResponse<AdminStatsResponse> getRefundsStats(@RequestParam(defaultValue = "12") int months) {
        try {
            return ApiResponse.success(adminStatsService.getRefundsStats(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/withdrawals")
    public ApiResponse<AdminStatsResponse> getWithdrawalsStats(@RequestParam(defaultValue = "12") int months) {
        try {
            return ApiResponse.success(adminStatsService.getWithdrawalsStats(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }

    @GetMapping("/thread-reports")
    public ApiResponse<AdminStatsResponse> getThreadReportsStats(@RequestParam(defaultValue = "12") int months) {
        try {
            return ApiResponse.success(adminStatsService.getThreadReportsStats(months));
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error("fail");
        }
    }
}
