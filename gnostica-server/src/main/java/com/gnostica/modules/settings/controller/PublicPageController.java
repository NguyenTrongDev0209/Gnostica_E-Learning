package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.dto.response.PageResponse;
import com.gnostica.modules.settings.service.PageService;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/pages")
@RequiredArgsConstructor
public class PublicPageController {
    private final PageService pageService;

    @GetMapping("/**")
    public ApiResponse<PageResponse> getPage(HttpServletRequest request) {
        String slug = request.getRequestURI().replaceFirst(".*/api/public/pages/", "");
        return ApiResponse.success(pageService.getPublished(slug));
    }
}
