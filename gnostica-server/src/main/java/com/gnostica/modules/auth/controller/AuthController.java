package com.gnostica.modules.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gnostica.modules.auth.dto.request.LoginRequest;
import com.gnostica.modules.auth.dto.response.LoginResponse;
import com.gnostica.modules.auth.dto.request.RegisterRequest;
import com.gnostica.modules.auth.dto.request.ResetPasswordRequest;
import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.core.model.Account;
import com.gnostica.modules.auth.dto.response.AccountResponse;
import com.gnostica.modules.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
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
                .data(AccountResponse.fromEntity(account))
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
                .message("ÄÄƒng nháº­p thÃ nh cÃ´ng")
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
                .message("ÄÄƒng kÃ½ thÃ nh cÃ´ng. Vui lÃ²ng kiá»ƒm tra email Ä‘á»ƒ nháº­n mÃ£ xÃ¡c thá»±c.")
                .data(account.getEmail()) // Tráº£ vá» email Ä‘á»ƒ front-end biáº¿t gá»­i mÃ£ xÃ¡c thá»±c cho ai
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
                .message("XÃ¡c thá»±c tÃ i khoáº£n thÃ nh cÃ´ng!")
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
                .message("MÃ£ xÃ¡c thá»±c má»›i Ä‘Ã£ Ä‘Æ°á»£c gá»­i vÃ o email cá»§a báº¡n.")
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
                .message("MÃ£ xÃ¡c thá»±c Ä‘Ã£ Ä‘Æ°á»£c gá»­i vÃ o email cá»§a báº¡n.")
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
                .message("Äá»•i máº­t kháº©u thÃ nh cÃ´ng! Báº¡n cÃ³ thá»ƒ Ä‘Äƒng nháº­p báº±ng máº­t kháº©u má»›i.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/become-instructor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> becomeInstructor(@RequestParam String email) {
        try {
            authService.becomeInstructor(email);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("ChÃºc má»«ng! Báº¡n Ä‘Ã£ trá»Ÿ thÃ nh Giáº£ng viÃªn.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @GetMapping("/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllAccounts() {
        return ResponseEntity.ok(ResponseDTO.builder()
            .status(200)
            .data(authService.getAllAccounts().stream().map(AccountResponse::fromEntity).toList())
            .build());
    }

    @GetMapping("/accounts/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAccountsByRole(@PathVariable String role) {
        return ResponseEntity.ok(ResponseDTO.builder()
            .status(200)
            .data(authService.getAccountsByRole(role).stream().map(AccountResponse::fromEntity).toList())
            .build());
    }

    @GetMapping("/accounts/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchAccounts(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) java.util.List<Integer> statuses,
            @org.springframework.data.web.PageableDefault(sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(ResponseDTO.builder()
            .status(200)
            .data(authService.searchAccounts(role, search, statuses, pageable).map(AccountResponse::fromEntity))
            .build());
    }

    @PostMapping("/accounts/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> lockAccount(@PathVariable java.util.UUID id, @RequestParam String reason) {
        try {
            authService.lockAccount(id, reason);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("TÃ i khoáº£n Ä‘Ã£ Ä‘Æ°á»£c khÃ³a.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }

    @PostMapping("/accounts/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unlockAccount(@PathVariable java.util.UUID id) {
        try {
            authService.unlockAccount(id);
            return ResponseEntity.ok(ResponseDTO.builder()
                .status(200)
                .message("TÃ i khoáº£n Ä‘Ã£ Ä‘Æ°á»£c má»Ÿ khÃ³a.")
                .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                .status(400)
                .message(e.getMessage())
                .build());
        }
    }
}
