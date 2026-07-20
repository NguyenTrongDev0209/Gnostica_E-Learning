package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.dto.request.BannerRequest;
import com.gnostica.modules.settings.dto.response.BannerResponse;
import com.gnostica.modules.settings.service.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminBannerController {
    private final BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerResponse>> getAll() {
        return ApiResponse.success(bannerService.getAll());
    }

    @PostMapping
    public ApiResponse<BannerResponse> create(@Valid @RequestBody BannerRequest request) {
        return ApiResponse.success("Đã tạo banner", bannerService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<BannerResponse> update(@PathVariable Integer id, @Valid @RequestBody BannerRequest request) {
        return ApiResponse.success("Đã cập nhật banner", bannerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        bannerService.delete(id);
        return ApiResponse.success("Đã xóa banner", null);
    }
}
