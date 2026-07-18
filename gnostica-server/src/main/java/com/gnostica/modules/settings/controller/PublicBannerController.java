package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.dto.response.BannerResponse;
import com.gnostica.modules.settings.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/banners")
@RequiredArgsConstructor
public class PublicBannerController {
    private final BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerResponse>> getBanners(@RequestParam String position) {
        return ApiResponse.success(bannerService.getActiveByPosition(position));
    }
}
