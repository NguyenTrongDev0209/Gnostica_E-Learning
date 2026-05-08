package com.gnostica.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.dto.response.QuestionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenRouterAiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openrouter.api-key}")
    private String apiKey;

    @Value("${openrouter.base-url}")
    private String baseUrl;

    @Value("${openrouter.model}")
    private String model;

    public List<QuestionDto> generateQuestions(String documentText, int count, String difficulty) throws Exception {
        String url = baseUrl + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:5173");
        headers.set("X-Title", "Gnostica E-Learning");

        // Limit the text to avoid context length overflow. Flash can handle ~1M tokens, but we truncate just in case.
        String context = documentText.length() > 500000 ? documentText.substring(0, 500000) : documentText;

        String systemPrompt = "Bạn là một chuyên gia giáo dục xuất sắc. Nhiệm vụ của bạn là đọc tài liệu dưới đây và tạo ra " + count + " câu hỏi trắc nghiệm.\n" +
                "Yêu cầu:\n" +
                "- Số lượng câu hỏi cần tạo: đúng " + count + " câu.\n" +
                "- Độ khó: " + difficulty + " (phải gán nhãn level là 'easy', 'medium', 'hard' hoặc trộn theo ngữ cảnh).\n" +
                "- Mỗi câu hỏi phải có chính xác 4 đáp án A, B, C, D.\n" +
                "- Có 1 đáp án đúng (thuộc tính 'correct' nhận giá trị 'A', 'B', 'C', hoặc 'D').\n" +
                "- BẮT BUỘC phải cung cấp lời giải thích ngắn gọn tại sao đáp án đó đúng vào thuộc tính 'explanation'.\n" +
                "QUAN TRỌNG NHẤT: BẠN PHẢI TRẢ VỀ KẾT QUẢ DƯỚI DẠNG MẢNG JSON NGUYÊN BẢN (Raw JSON Array). Không thêm markdown (như ```json), không thêm chữ thừa, CHỈ trả về đúng chuỗi JSON như cấu trúc sau:\n" +
                "[\n" +
                "  {\n" +
                "    \"text\": \"Nội dung câu hỏi...\",\n" +
                "    \"options\": {\"A\": \"Đáp án A\", \"B\": \"Đáp án B\", \"C\": \"Đáp án C\", \"D\": \"Đáp án D\"},\n" +
                "    \"correct\": \"A\",\n" +
                "    \"level\": \"easy\",\n" +
                "    \"explanation\": \"Lời giải chi tiết...\"\n" +
                "  }\n" +
                "]";

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", "Dưới đây là tài liệu của bài giảng:\n\n" + context));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        // Using low temperature for consistent JSON structure
        body.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        log.info("Sending request to OpenRouter to generate {} questions.", count);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");
                
                // Clean the content if AI includes markdown block
                if (content.startsWith("```json")) {
                    content = content.replaceFirst("```json", "");
                }
                if (content.endsWith("```")) {
                    content = content.substring(0, content.lastIndexOf("```"));
                }
                content = content.trim();
                
                log.info("Received generated JSON from AI.");
                try {
                    return objectMapper.readValue(content, new TypeReference<List<QuestionDto>>() {});
                } catch (Exception e) {
                    log.error("Failed to parse AI response into QuestionDto list: {}", content, e);
                    throw new RuntimeException("Lỗi định dạng dữ liệu từ AI. Xin vui lòng thử lại.");
                }
            }
        }
        
        throw new RuntimeException("Không thể nhận phản hồi từ dịch vụ AI.");
    }
}
