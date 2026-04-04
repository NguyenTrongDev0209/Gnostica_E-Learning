package com.gnostica.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.dto.LoginRequest;
import com.gnostica.dto.RegisterRequest;
import com.gnostica.dto.ResponseDTO;
import com.gnostica.model.Account;
import com.gnostica.service.AuthService;

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
            Account account = authService.login(loginRequest);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("Đăng nhập thành công")
                .data(account)
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
}
