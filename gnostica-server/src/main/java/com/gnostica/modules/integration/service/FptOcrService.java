package com.gnostica.modules.integration.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FptOcrService {

    @Value("${openrouter.api-key}")
    private String apiKey;

    @Value("${openrouter.base-url}")
    private String baseUrl;

    @Value("${openrouter.model}")
    private String model;

    @Value("${app.public-url}")
    private String publicUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sends the ID card image URL to OpenRouter's Gemini Vision model to extract the name
     * and returns the result in FPT.AI's response format to ensure compatibility.
     *
     * @param imageUrl The public URL of the front side of the ID card
     * @return JSON response matching FPT.AI format
     */
    public String extractIdCardInfo(String imageUrl) {
        try {
            String url = baseUrl + "/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", publicUrl);
            headers.set("X-Title", "Gnostica E-Learning");

            // Construct multimodal request content with prompt and image url
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("type", "text");
            textPart.put("text", "Extract the full name from the front side of this Vietnamese National ID Card (CCCD/CMND).\n" +
                    "Return a JSON object matching this exact structure:\n" +
                    "{\n" +
                    "  \"errorCode\": 0,\n" +
                    "  \"data\": [\n" +
                    "    {\n" +
                    "      \"name\": \"FULL NAME IN UPPERCASE (e.g. NGUYỄN VĂN A)\",\n" +
                    "      \"name_prob\": 0.98\n" +
                    "    }\n" +
                    "  ]\n" +
                    "}\n" +
                    "If the image is not a valid ID card, is blurry, or contains no readable name, return:\n" +
                    "{\n" +
                    "  \"errorCode\": 1,\n" +
                    "  \"data\": []\n" +
                    "}\n" +
                    "Return ONLY the raw JSON object. Do not include any markdown formatting like ```json.");

            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("type", "image_url");
            Map<String, String> imageUrlObj = new HashMap<>();
            imageUrlObj.put("url", imageUrl);
            imagePart.put("image_url", imageUrlObj);

            List<Object> contentList = new ArrayList<>();
            contentList.add(textPart);
            contentList.add(imagePart);

            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", contentList);

            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(message);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", messages);
            body.put("temperature", 0.1);
            body.put("max_tokens", 500);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choiceMessage = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) choiceMessage.get("content");

                    if (content.startsWith("```json")) {
                        content = content.replaceFirst("```json", "");
                    }
                    if (content.endsWith("```")) {
                        content = content.substring(0, content.lastIndexOf("```"));
                    }
                    return content.trim();
                }
            }
            throw new RuntimeException("No response from OpenRouter AI");
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify ID card: " + e.getMessage(), e);
        }
    }
}
