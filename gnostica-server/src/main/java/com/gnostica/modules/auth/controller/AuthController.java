package com.gnostica.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.gnostica.modules.auth.dto.request.LoginRequest;
import com.gnostica.modules.auth.dto.response.LoginResponse;
import com.gnostica.modules.auth.dto.request.RegisterRequest;
import com.gnostica.modules.auth.dto.request.ResetPasswordRequest;
import com.gnostica.modules.auth.dto.response.AdminAccountResponse;
import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.core.model.Account;
import com.gnostica.modules.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") 
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ResponseDTO.builder()
                .status(401)
                .message("Chưa đăng nhập!")
                .build());
        }
        try {
            Account account = authService.findByEmail(authentication.getName());
            AdminAccountResponse response = AdminAccountResponse.builder()
                    .id(account.getId())
                    .email(account.getEmail())
                    .fullName(account.getFullName())
                    .phone(account.getPhone())
                    .avatar(account.getAvatar())
                    .provider(account.getProvider())
                    .birthDay(account.getBirthDay())
                    .status(account.getStatus())
                    .role(account.getRole() != null ? account.getRole().getName() : "USER")
                    .createdAt(account.getCreatedAt())
                    .updatedAt(account.getUpdatedAt())
                    .build();
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .data(response)
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Đăng nhập thành công")
                .data(loginResponse)
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(ResponseDTO.builder()
                .status(401)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody com.gnostica.modules.auth.dto.request.GoogleLoginRequest request) {
        try {
            LoginResponse loginResponse = authService.loginWithGoogle(request);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Đăng nhập bằng Google thành công")
                .data(loginResponse)
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Account account = authService.register(registerRequest);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác thực.")
                .data(account.getEmail())
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String email, 
                                  @RequestParam String code) {
        try {
            authService.verifyOTP(email, code);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Xác thực tài khoản thành công!")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOTP(@RequestParam String email) {
        try {
            authService.resendVerificationEmail(email);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Mã xác thực mới đã được gửi vào email của bạn.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Mã xác thực đã được gửi vào email của bạn.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/become-instructor")
    public ResponseEntity<?> becomeInstructor(@RequestParam String email) {
        try {
            authService.becomeInstructor(email);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Chúc mừng! Bạn đã trở thành Giảng viên.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @GetMapping("/accounts")
    public ResponseEntity<?> getAllAccounts() {
        return ResponseEntity.ok(ResponseDTO.builder()
            .status(200)
            .data(authService.getAllAccounts())
            .build());
    }

    @GetMapping("/accounts/role/{role}")
    public ResponseEntity<?> getAccountsByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page < 0 || size < 1 || size > 100) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message("page phai >= 0 va size nam trong khoang 1-100.")
                    .build());
        }
        return ResponseEntity.ok(ResponseDTO.builder()
            .status(200)
            .data(authService.getAccountsByRole(role, page, size))
            .build());
    }

    @PostMapping("/accounts/{id}/lock")
    public ResponseEntity<?> lockAccount(@PathVariable java.util.UUID id, @RequestParam String reason) {
        try {
            authService.lockAccount(id, reason);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Tài khoản đã được khóa.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/accounts/{id}/unlock")
    public ResponseEntity<?> unlockAccount(@PathVariable java.util.UUID id) {
        try {
            authService.unlockAccount(id);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Tài khoản đã được mở khóa.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }
}
