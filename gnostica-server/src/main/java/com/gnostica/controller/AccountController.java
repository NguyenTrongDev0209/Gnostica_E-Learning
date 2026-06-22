package com.gnostica.controller;

import com.gnostica.dto.response.ResponseDTO;
import com.gnostica.service.AuthService;
import com.gnostica.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountController {

    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestParam("file") MultipartFile file, @RequestParam("email") String email) {
        try {
            // Upload to Cloudinary with high quality avatar settings (gravity face, crop thumb)
            String avatarUrl = cloudinaryService.uploadAvatar(file);
            
            // Update user record in database
            authService.updateAvatar(email, avatarUrl);
            
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Cập nhật ảnh đại diện thành công!")
                    .data(Map.of("avatarUrl", avatarUrl))
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message("Cập nhật ảnh đại diện thất bại: " + e.getMessage())
                    .build());
        }
    }

    @PutMapping("/personalization")
    public ResponseEntity<?> updatePersonalization(@RequestBody com.gnostica.dto.PersonalizationDTO dto, @RequestParam("email") String email) {
        try {
            authService.updatePersonalization(email, dto);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .status(200)
                    .message("Cập nhật thông tin cá nhân hóa thành công!")
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDTO.builder()
                    .status(400)
                    .message("Cập nhật thất bại: " + e.getMessage())
                    .build());
        }
    }
}
