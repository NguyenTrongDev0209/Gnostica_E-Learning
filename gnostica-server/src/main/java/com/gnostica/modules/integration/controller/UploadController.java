package com.gnostica.modules.integration.controller;

import com.gnostica.core.config.BunnyNetConfig;
import com.gnostica.modules.integration.service.BunnyNetService;
import com.gnostica.modules.integration.service.BunnyStorageService;
import com.gnostica.modules.integration.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.nio.charset.StandardCharsets;
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
            String fileName = bunnyStorageService.uploadDocument(file);
            String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/upload/document/")
                    .pathSegment(fileName)
                    .build()
                    .encode()
                    .toUriString();
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Document upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/document/{fileName:.+}")
    public ResponseEntity<byte[]> viewDocument(@PathVariable String fileName) {
        try {
            BunnyStorageService.StoredDocument document = bunnyStorageService.downloadDocument(fileName);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(document.contentType());
            headers.setContentDisposition(ContentDisposition.inline()
                    .filename(fileName, StandardCharsets.UTF_8)
                    .build());
            headers.setCacheControl("private, max-age=300");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document.content());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(502).build();
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

    @DeleteMapping("/document/{fileName}")
    public ResponseEntity<?> deleteDocument(@PathVariable String fileName) {
        try {
            boolean success = bunnyStorageService.deleteDocument(fileName);
            if (success) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(500).body(Map.of("message", "Could not delete document from storage"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
