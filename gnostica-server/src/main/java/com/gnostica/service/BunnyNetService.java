package com.gnostica.service;

import com.gnostica.config.BunnyNetConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class BunnyNetService {

    @Autowired
    private BunnyNetConfig bunnyNetConfig;

    public Map<String, Object> createVideoInteraction(String videoTitle) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://video.bunnycdn.com/library/" + bunnyNetConfig.getLibraryId() + "/videos";

        HttpHeaders headers = new HttpHeaders();
        headers.set("AccessKey", bunnyNetConfig.getApiKey());
        headers.set("Accept", "application/json");
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = new HashMap<>();
        body.put("title", videoTitle != null && !videoTitle.isEmpty() ? videoTitle : "New Lesson Video");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                // Returns video metadata including the standard "guid" (videoId)
                return response.getBody();
            }
        } catch (Exception e) {
            System.err.println("BunnyNet API Error: " + e.getMessage());
        }
        return null;
    }

    public boolean deleteVideo(String libraryId, String videoId) {
        String targetLibrary = (libraryId != null && !libraryId.isEmpty() && !libraryId.equals("null")) ? libraryId : bunnyNetConfig.getLibraryId();
        String url = "https://video.bunnycdn.com/library/" + targetLibrary + "/videos/" + videoId;
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("AccessKey", bunnyNetConfig.getApiKey());
        headers.set("Accept", "application/json");

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.DELETE, request, Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("BunnyNet API Delete Error for video " + videoId + ": " + e.getMessage());
            return false;
        }
    }
}
