package com.gnostica.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gnostica.modules.auth.dto.request.LoginRequest;
import com.gnostica.modules.auth.dto.response.LoginResponse;
import com.gnostica.modules.auth.dto.request.RegisterRequest;
import com.gnostica.modules.auth.dto.request.ResetPasswordRequest;
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

    @org.springframework.web.bind.annotation.GetMapping("/user")
    public ResponseEntity<?> getUser(@org.springframework.web.bind.annotation.RequestParam String email) {
        System.out.println("GET USER endpoint called with email: [" + email + "]");
        try {
            Account account = authService.findByEmail(email);
            System.out.println("Found user: " + account.getEmail());
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .data(account)
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


    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            Account account = authService.register(registerRequest);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác thực.")
                .data(account.getEmail()) // Trả về email để front-end biết gửi mã xác thực cho ai
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@org.springframework.web.bind.annotation.RequestParam String email, 
                                  @org.springframework.web.bind.annotation.RequestParam String code) {
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
    public ResponseEntity<?> resendOTP(@org.springframework.web.bind.annotation.RequestParam String email) {
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
    public ResponseEntity<?> getAccountsByRole(@PathVariable String role) {
        return ResponseEntity.ok(ResponseDTO.builder()
            .status(200)
            .data(authService.getAccountsByRole(role))
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
