package com.gnostica.modules.auth.controller;

import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.auth.dto.response.AdminAccountResponse;
import com.gnostica.modules.auth.service.AdminAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    @GetMapping
    public ResponseEntity<?> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdminAccountResponse> accountsPage = adminAccountService.getAllAccounts(pageable, role, search);
        return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Lấy danh sách tài khoản thành công")
                .data(accountsPage)
                .build());
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<?> lockAccount(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "Vi phạm điều khoản dịch vụ") String reason,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            adminAccountService.lockAccount(id, reason, adminEmail);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Tài khoản đã được khóa thành công.")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<?> unlockAccount(
            @PathVariable UUID id,
            Authentication authentication) {
        try {
            String adminEmail = authentication.getName();
            adminAccountService.unlockAccount(id, adminEmail);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Tài khoản đã được mở khóa thành công.")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build());
        }
    }
}
