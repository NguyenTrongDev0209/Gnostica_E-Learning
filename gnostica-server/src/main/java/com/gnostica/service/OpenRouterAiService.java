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

    /**
     * Processes timestamped transcript text and conducts rigorous multi-category policy scan.
     * Returns raw sanitized JSON string conforming to final architectural requirements.
     */
    public String getAiModerationJson(String transcriptText) throws Exception {
        String url = baseUrl + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:5173");
        headers.set("X-Title", "Gnostica E-Learning");

        String systemPrompt = "Bạn là một chuyên gia kiểm duyệt nội dung giáo dục xuất sắc. Nhiệm vụ của bạn là đọc nội dung phụ đề video (kèm mốc thời gian) hoặc toàn bộ văn bản thông tin khóa học, chương, và bài giảng để phân tích vi phạm chính sách hệ thống.\n" +
                "Tiêu chí phân loại vi phạm:\n" +
                "1. ABUSIVE (Ngôn từ thô tục): Chửi bậy, kích động thù hận, kỳ thị cá nhân/giới tính/tôn giáo. Severity: CRITICAL.\n" +
                "2. EXTERNAL_MARKETING (Lôi kéo quảng cáo): Kêu gọi học viên giao dịch chuyển khoản riêng, đọc số điện thoại, Zalo hoặc Facebook cá nhân để bán tài liệu trốn phí nền tảng. Severity: HIGH.\n" +
                "3. PEDAGOGICAL (Chất lượng sư phạm): Sử dụng quá nhiều từ đệm lặp lại vô nghĩa (à, ờ, thì, là) quá mức gây loãng, lặp từ nghiêm trọng hoặc nói lạc đề hoàn toàn. Severity: WARNING.\n" +
                "4. LEGAL (Pháp luật): Tuyên truyền thông tin sai lệch, bóp méo xuyên tạc pháp luật Việt Nam. Severity: CRITICAL.\n\n" +
                "QUAN TRỌNG: Nếu là dữ liệu phụ đề video, bạn phải trích chính xác mốc thời gian xảy ra từ đầu vào. Nếu là văn bản khóa học/chương/bài giảng, bạn hãy để giá trị cột \"time\" là N/A hoặc tên vị trí (VD: 'Tiêu đề', 'Chương 1', 'Bài học 3').\n" +
                "BẮT BUỘC PHẢI TRẢ VỀ KẾT QUẢ DƯỚI DẠNG JSON NGUYÊN BẢN (RAW JSON) KHÔNG BAO QUANH BỞI MARKDOWN, TRẢ VỀ ĐÚNG PHIÊN BẢN SAU:\n" +
                "{\n" +
                "  \"safetyScore\": 90, // Thang 0-100. Càng nhiều lỗi nặng thì điểm càng thấp.\n" +
                "  \"assessment\": \"Đánh giá nhận xét tổng quát ngắn gọn bằng tiếng Việt...\",\n" +
                "  \"violations\": [\n" +
                "    {\n" +
                "      \"time\": \"01:25 hoặc Tên vị trí\", // Mốc thời gian hoặc vị trí vi phạm.\n" +
                "      \"type\": \"ABUSIVE | EXTERNAL_MARKETING | PEDAGOGICAL | LEGAL\",\n" +
                "      \"content\": \"Cụm từ gốc vi phạm trích từ nội dung...\",\n" +
                "      \"severity\": \"CRITICAL | HIGH | WARNING\",\n" +
                "      \"explanation\": \"Giải thích tại sao vi phạm bằng tiếng Việt...\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "Nếu không có lỗi nào, mảng \"violations\" trả về rỗng [] và safetyScore là 100.";

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", "Nội dung phụ đề bài giảng cần kiểm duyệt:\n\n" + transcriptText));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", 0.2); // Lower temperature for strictly deterministic JSON output

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        log.info("Calling AI to perform policy moderation scan.");
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                String content = (String) message.get("content");

                // Clean Markdown wrapping if present
                if (content.startsWith("```json")) {
                    content = content.replaceFirst("```json", "");
                }
                if (content.endsWith("```")) {
                    content = content.substring(0, content.lastIndexOf("```"));
                }
                return content.trim();
            }
        }
        throw new RuntimeException("Không thể nhận phản hồi kiểm duyệt từ AI.");
    }
}
