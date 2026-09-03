package com.gnostica.modules.auth.controller;

import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.auth.service.AuthService;
import com.gnostica.modules.integration.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestParam("file") MultipartFile file, org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ResponseDTO.builder()
                    .status(401)
                    .message("Vui lÃ²ng Ä‘Äƒng nháº­p")
                    .build());
        }
        try {
            // Upload to Cloudinary with high quality avatar settings (gravity face, crop thumb)
            String avatarUrl = cloudinaryService.uploadAvatar(file);
            
            // Update user record in database
            authService.updateAvatar(authentication.getName(), avatarUrl);
            
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n thÃ nh cÃ´ng!")
                    .data(Map.of("avatarUrl", avatarUrl))
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message("Cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n tháº¥t báº¡i: " + e.getMessage())
                    .build());
        }
    }

    @PutMapping("/personalization")
    public ResponseEntity<?> updatePersonalization(@RequestBody com.gnostica.modules.user.dto.request.PersonalizationDTO dto, org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ResponseDTO.builder()
                    .status(401)
                    .message("Vui lÃ²ng Ä‘Äƒng nháº­p")
                    .build());
        }
        try {
            authService.updatePersonalization(authentication.getName(), dto);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n hÃ³a thÃ nh cÃ´ng!")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message("Cáº­p nháº­t tháº¥t báº¡i: " + e.getMessage())
                    .build());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody com.gnostica.modules.auth.dto.request.ProfileUpdateRequest dto, org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ResponseDTO.builder()
                    .status(401)
                    .message("Vui lÃ²ng Ä‘Äƒng nháº­p")
                    .build());
        }
        try {
            authService.updateProfile(authentication.getName(), dto);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Cáº­p nháº­t thÃ´ng tin há»“ sÆ¡ thÃ nh cÃ´ng!")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message("Cáº­p nháº­t thÃ´ng tin tháº¥t báº¡i: " + e.getMessage())
                    .build());
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody com.gnostica.modules.auth.dto.request.ChangePasswordRequest request, org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ResponseDTO.builder()
                    .status(401)
                    .message("Vui lÃ²ng Ä‘Äƒng nháº­p")
                    .build());
        }
        try {
            authService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Äá»•i máº­t kháº©u thÃ nh cÃ´ng!")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message(e.getMessage())
                    .build());
        }
    }
}
