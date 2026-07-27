package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/site-config")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SystemSettingsService settingsService;

    @GetMapping
    public ApiResponse<Map<String, String>> getSiteConfig() {
        return ApiResponse.success(settingsService.getPublicSettings());
    }
}
