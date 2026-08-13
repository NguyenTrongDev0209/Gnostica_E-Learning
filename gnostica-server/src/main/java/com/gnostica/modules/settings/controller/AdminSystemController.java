package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.dto.response.SystemMetricsResponse;
import com.gnostica.modules.settings.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class AdminSystemController {

    private final SystemService systemService;

    @GetMapping("/metrics")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<SystemMetricsResponse>> getSystemMetrics() {
        SystemMetricsResponse metrics = systemService.getSystemMetrics();
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }
}
