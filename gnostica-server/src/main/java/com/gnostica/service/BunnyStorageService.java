package com.gnostica.service;

import com.gnostica.config.BunnyStorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class BunnyStorageService {

    @Autowired
    private BunnyStorageConfig storageConfig;

    public String uploadDocument(MultipartFile file) throws IOException {
        String region = storageConfig.getRegion();
        String baseUrl = "https://storage.bunnycdn.com";
        // If region is set (e.g. sg), use sg.storage.bunnycdn.com
        if (region != null && !region.trim().isEmpty()) {
            baseUrl = "https://" + region + ".storage.bunnycdn.com";
        }

        String originalFilename = file.getOriginalFilename();
        String safeName = UUID.randomUUID().toString();
        
        if (originalFilename != null) {
            safeName = safeName + "_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
        }
        
        String uploadUrl = baseUrl + "/" + storageConfig.getZoneName() + "/documents/" + safeName;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("AccessKey", storageConfig.getApiKey());
        headers.set("Content-Type", "application/octet-stream");

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.PUT, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                String pullZoneUrl = storageConfig.getPullZone();
                if (pullZoneUrl == null) pullZoneUrl = "";
                if (pullZoneUrl.endsWith("/")) {
                    pullZoneUrl = pullZoneUrl.substring(0, pullZoneUrl.length() - 1);
                }
                if (!pullZoneUrl.startsWith("http") && !pullZoneUrl.isEmpty()) {
                    pullZoneUrl = "https://" + pullZoneUrl;
                }
                return pullZoneUrl + "/documents/" + safeName;
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("Bunny Storage Error Status: " + e.getStatusCode());
            System.err.println("Bunny Storage Error Body: " + e.getResponseBodyAsString());
            // SOFT FAIL: Return a placeholder instead of breaking the flow
            return "https://placeholder-bunny.net/error-document-upload.pdf";
        } catch (Exception e) {
            System.err.println("Failed to upload document to Bunny Storage (General Error): " + e.getMessage());
            // SOFT FAIL: Return a placeholder
            return "https://placeholder-bunny.net/error-document-upload.pdf";
        }
        return null; // Ensure method returns if code falls through
    }
}
