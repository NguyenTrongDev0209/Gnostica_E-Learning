package com.gnostica.controller;

import com.gnostica.config.BunnyNetConfig;
import com.gnostica.service.BunnyNetService;
import com.gnostica.service.BunnyStorageService;
import com.gnostica.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Adjust based on env
public class UploadController {

    private final CloudinaryService cloudinaryService;
    private final BunnyNetService bunnyNetService;
    private final BunnyStorageService bunnyStorageService;
    private final BunnyNetConfig bunnyNetConfig;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Image upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/document")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            String url = bunnyStorageService.uploadDocument(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Document upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/video/init")
    public ResponseEntity<Map<String, Object>> initVideoUpload(@RequestBody Map<String, String> request) {
        try {
            String title = request.get("title");
            Map<String, Object> bunnyResponse = bunnyNetService.createVideoInteraction(title);
            if (bunnyResponse != null && bunnyResponse.containsKey("guid")) {
                String videoId = (String) bunnyResponse.get("guid");
                long expirationTime = (System.currentTimeMillis() / 1000L) + 3600; // 1 hour expiration
                
                String stringToSign = bunnyNetConfig.getLibraryId() + bunnyNetConfig.getApiKey() + expirationTime + videoId;
                
                java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hash = md.digest(stringToSign.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder(2 * hash.length);
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) {
                        hexString.append('0');
                    }
                    hexString.append(hex);
                }
                String signature = hexString.toString();

                Map<String, Object> response = new HashMap<>();
                response.put("videoId", videoId);
                response.put("libraryId", bunnyNetConfig.getLibraryId());
                response.put("pullZoneUrl", bunnyNetConfig.getPullZone());
                response.put("authorizationSignature", signature);
                response.put("authorizationExpire", expirationTime);
                
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/video/{libraryId}/{videoId}")
    public ResponseEntity<?> deleteVideo(@PathVariable String libraryId, @PathVariable String videoId) {
        try {
            boolean success = bunnyNetService.deleteVideo(libraryId, videoId);
            if (success) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(500).body(Map.of("message", "Could not delete video from CDN"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
