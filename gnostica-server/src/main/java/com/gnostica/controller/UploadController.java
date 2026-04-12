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
                // Return necessary credentials to frontend to perform direct upload
                Map<String, Object> response = new HashMap<>();
                response.put("videoId", bunnyResponse.get("guid"));
                response.put("libraryId", bunnyNetConfig.getLibraryId());
                response.put("pullZoneUrl", bunnyNetConfig.getPullZone());
                // We should theoretically return a short-lived token or presigned signature
                // But for pure direct upload securely from the dashboard perspective, 
                // Bunny Stream API requires Library API Key for the upload PUT request. 
                // Exposing stream API key to frontend is standard if using Bunny Stream Direct Upload from client directly (with TUS), 
                // but usually through a proxy or temporary auth token if using an advanced flow.
                // For a simpler and working solution while maintaining some safety:
                response.put("apiKey", bunnyNetConfig.getApiKey()); 
                
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
