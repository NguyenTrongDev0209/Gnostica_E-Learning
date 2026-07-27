package com.gnostica.modules.settings.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.settings.dto.request.PageRequest;
import com.gnostica.modules.settings.dto.response.PageResponse;
import com.gnostica.modules.settings.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pages")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminPageController {
    private final PageService pageService;

    @GetMapping
    public ApiResponse<List<PageResponse>> getAll() {
        return ApiResponse.success(pageService.getAll());
    }

    @PostMapping
    public ApiResponse<PageResponse> create(@Valid @RequestBody PageRequest request) {
        return ApiResponse.success("Đã tạo trang", pageService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PageResponse> update(@PathVariable Integer id, @Valid @RequestBody PageRequest request) {
        return ApiResponse.success("Đã cập nhật trang", pageService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        pageService.delete(id);
        return ApiResponse.success("Đã xóa trang", null);
    }
}
