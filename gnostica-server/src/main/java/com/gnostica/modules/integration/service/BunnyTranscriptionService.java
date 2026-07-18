package com.gnostica.modules.integration.service;

import com.gnostica.core.config.BunnyNetConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BunnyTranscriptionService {

    private final BunnyNetConfig bunnyNetConfig;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Triggers Bunny.net automated AI transcription for a specific video.
     * Standard endpoint: POST /library/{libraryId}/videos/{videoId}/transcribe
     */
    public boolean triggerTranscription(String libraryId, String videoId) {
        String targetLibrary = (libraryId != null && !libraryId.isEmpty()) ? libraryId : bunnyNetConfig.getLibraryId();
        String url = "https://video.bunnycdn.com/library/" + targetLibrary + "/videos/" + videoId + "/transcribe";

        HttpHeaders headers = new HttpHeaders();
        headers.set("AccessKey", bunnyNetConfig.getApiKey());
        headers.set("Accept", "application/json");
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("sourceLanguage", "vi");
        body.put("targetLanguages", List.of("vi"));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            log.info("Triggering automatic Bunny.net transcription for videoId: {} in library: {}", videoId, targetLibrary);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully initiated transcription on Bunny.net for videoId: {}", videoId);
                return true;
            }
        } catch (Exception e) {
            log.warn("Bunny.net transcribe trigger error for video {}: {}", videoId, e.getMessage());
        }
        return false;
    }

    /**
     * Downloads raw .vtt WebVTT subtitle track text directly from Bunny CDN.
     */
    public String fetchSubtitleVtt(String videoId) {
        // Using direct CDN path format: https://{pull_zone_url}.b-cdn.net/{video_id}/captions/vi.vtt
        String pullZone = bunnyNetConfig.getPullZone();
        String url = "https://" + pullZone + ".b-cdn.net/" + videoId + "/captions/vi.vtt";

        try {
            log.info("Downloading transcript from URL: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("Failed to download .vtt transcript from {}: {}", url, e.getMessage());
        }
        return null;
    }
}
