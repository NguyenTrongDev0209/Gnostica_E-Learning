package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.dto.request.UpdateSystemSettingsRequest;
import com.gnostica.modules.settings.service.SystemSettingsService;
import com.gnostica.modules.integration.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminSettingsController {

    private final SystemSettingsService settingsService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ApiResponse<Map<String, String>> getSettings() {
        return ApiResponse.success(settingsService.getAdminSettings());
    }

    @PutMapping
    public ApiResponse<Map<String, String>> updateSettings(
            @Valid @RequestBody UpdateSystemSettingsRequest request) {
        return ApiResponse.success("Đã lưu cấu hình hệ thống", settingsService.updateSettings(request.getValues()));
    }

    @PostMapping("/assets")
    public ApiResponse<Map<String, String>> uploadAsset(@RequestParam("file") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp ảnh không được để trống");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Tệp ảnh không được vượt quá 2MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !Set.of("image/png", "image/jpeg", "image/webp", "image/svg+xml").contains(contentType)) {
            throw new IllegalArgumentException("Định dạng ảnh không được hỗ trợ");
        }
        return ApiResponse.success(Map.of("url", cloudinaryService.uploadImage(file)));
    }
}
