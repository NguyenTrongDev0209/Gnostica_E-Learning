package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.core.model.Account;
import com.gnostica.modules.settings.dto.request.CreateCommissionRequest;
import com.gnostica.modules.settings.dto.response.CommissionResponse;
import com.gnostica.modules.settings.service.CommissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.gnostica.core.util.AuthUtil;

import java.util.List;

@RestController
@RequestMapping("/api/admin/commissions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class CommissionController {

    private final CommissionService commissionService;

    @GetMapping
    public ApiResponse<List<CommissionResponse>> getCommissions() {
        return ApiResponse.success(commissionService.getGlobalCommissions());
    }

    @GetMapping("/active")
    public ApiResponse<CommissionResponse> getActiveCommission() {
        return ApiResponse.success(commissionService.getActiveGlobalCommission());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<CommissionResponse> createCommission(
            @Valid @RequestPart("data") CreateCommissionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) throws Exception {
        String adminEmail = AuthUtil.getCurrentUserEmail();
        return ApiResponse.success("Đã lưu tỷ lệ hoa hồng mới", commissionService.createCommission(request, file, adminEmail));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ApiResponse<CommissionResponse> updateCommission(
            @PathVariable Integer id,
            @Valid @RequestPart("data") CreateCommissionRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) throws Exception {
        return ApiResponse.success("Cập nhật tỷ lệ hoa hồng thành công", commissionService.updateCommission(id, request, file));
    }

    @PostMapping("/{id}/notify")
    public ApiResponse<CommissionResponse> notifyCommission(@PathVariable Integer id) throws Exception {
        return ApiResponse.success("Đã gửi email thông báo thành công", commissionService.notifyCommission(id));
    }
}
