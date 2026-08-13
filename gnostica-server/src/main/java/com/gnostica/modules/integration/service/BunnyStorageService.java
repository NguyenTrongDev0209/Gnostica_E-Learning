package com.gnostica.modules.integration.service;

import com.gnostica.core.config.BunnyStorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
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

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadDocument(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String safeName = UUID.randomUUID().toString();
        
        if (originalFilename != null) {
            safeName = safeName + "_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
        }
        
        String uploadUrl = buildStorageUrl(safeName);

        HttpHeaders headers = new HttpHeaders();
        headers.set("AccessKey", storageConfig.getApiKey());
        headers.set("Content-Type", "application/octet-stream");

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.PUT, requestEntity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return safeName;
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("Bunny Storage Error Status: " + e.getStatusCode());
            System.err.println("Bunny Storage Error Body: " + e.getResponseBodyAsString());
            throw new IOException("Bunny Storage rejected the document upload", e);
        } catch (Exception e) {
            System.err.println("Failed to upload document to Bunny Storage (General Error): " + e.getMessage());
            throw new IOException("Could not upload document to Bunny Storage", e);
        }
        throw new IOException("Bunny Storage returned an unsuccessful upload response");
    }

    public StoredDocument downloadDocument(String fileName) {
        validateFileName(fileName);

        HttpHeaders headers = new HttpHeaders();
        headers.set("AccessKey", storageConfig.getApiKey());
        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
                buildStorageUrl(fileName),
                HttpMethod.GET,
                requestEntity,
                byte[].class
        );

        MediaType contentType = response.getHeaders().getContentType();
        if (contentType == null || MediaType.APPLICATION_OCTET_STREAM.equals(contentType)) {
            contentType = MediaTypeFactory.getMediaType(fileName)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);
        }

        return new StoredDocument(response.getBody(), contentType);
    }

    private String buildStorageUrl(String fileName) {
        String region = storageConfig.getRegion();
        String baseUrl = "https://storage.bunnycdn.com";
        if (region != null && !region.trim().isEmpty()) {
            baseUrl = "https://" + region.trim() + ".storage.bunnycdn.com";
        }
        return baseUrl + "/" + storageConfig.getZoneName() + "/documents/" + fileName;
    }

    private void validateFileName(String fileName) {
        if (fileName == null || fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException("Invalid document file name");
        }
    }

    public record StoredDocument(byte[] content, MediaType contentType) {}
}
