package com.gnostica.service;

import com.gnostica.dto.request.AiChatRequest;
import com.gnostica.dto.response.AiChatResponse;
import com.gnostica.model.Course;
import com.gnostica.model.ForumCategory;
import com.gnostica.model.Thread;
import com.gnostica.repository.CourseRepository;
import com.gnostica.repository.ForumCategoryRepository;
import com.gnostica.repository.ThreadRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final RestTemplate restTemplate;
    private final ThreadRepository threadRepository;
    private final ForumCategoryRepository forumCategoryRepository;
    private final CourseRepository courseRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openrouter.api-key}")
    private String apiKey;

    @Value("${openrouter.base-url}")
    private String baseUrl;

    @Value("${openrouter.model}")
    private String model;

    public AiChatResponse getChatResponse(AiChatRequest request) {
        String url = baseUrl + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:5173"); 
        headers.set("X-Title", "Gnostica E-Learning");

        // Prepare messages for the loop
        List<Map<String, Object>> currentMessages = new ArrayList<>();
        if (request.getMessages() != null) {
            for (AiChatRequest.Message m : request.getMessages()) {
                Map<String, Object> map = new HashMap<>();
                map.put("role", m.getRole());
                map.put("content", m.getContent());
                currentMessages.add(map);
            }
        }

        // Add System message for context implicitly if none is provided
        if(currentMessages.isEmpty() || !currentMessages.get(0).get("role").equals("system")) {
            Map<String, Object> systemMap = new HashMap<>();
            systemMap.put("role", "system");
            systemMap.put("content", "Bạn là một trợ lý ảo của Gnostica E-Learning. Bạn có thể truy cập DB để tìm bài viết và khóa học. " +
                    "\nQUY TẮC BẮT BUỘC:" +
                    "\n1. TUYỆT ĐỐI KHÔNG LẤY DỮ LIỆU GIẢ, ẢO HOẶC DỮ LIỆU DO AI TỰ PHÁT SINH/TỰ BỊA RA. Chỉ lấy dữ liệu thực tế tồn tại trong cơ sở dữ liệu thông qua việc gọi hàm (tools) kết nối Database. Nếu Database trống hoặc không tìm thấy, bạn bắt buộc phải báo là không có kết quả thực tế, tuyệt đối không được tự ý điền thông tin giả mạo vào các thẻ CARD." +
                    "\n2. KHÔNG ĐƯỢC trả lời bằng danh sách thuần văn bản thô (bullet points, plain text, hyphens, v.v.). Khi hiển thị bất kỳ danh sách nào (khóa học, bài viết, chuyên mục, hay người đóng góp), bạn BẮT BUỘC phải chuyển đổi từng phần tử trong danh sách thành định dạng thẻ Card sau để giao diện hiển thị đẹp mắt: `[[CARD:TYPE|id|title|info|author|category|imageUrl]]`." +
                    "\n3. KHÔNG trả lời bằng khoảng trắng hoặc tin nhắn trống. Nếu không có hoặc không tìm thấy dữ liệu, hãy phản hồi rõ ràng bằng câu chữ lịch sự." +
                    "\n4. NẾU kết quả từ database (gọi hàm/tool) trả về chứa cụm từ 'DATABASE_EMPTY' hoặc báo không tìm thấy kết quả, bạn BẮT BUỘC phải thông báo lại trực tiếp và lịch sự với người dùng rằng không có kết quả phù hợp trong hệ thống (ví dụ: 'Rất tiếc, hiện tại hệ thống chưa có khóa học nào như vậy.'). CẤM TUYỆT ĐỐI việc tự bịa ra thông tin giả mạo để điền vào thẻ CARD." +
                    "\n\nChi tiết định dạng thẻ Card:" +
                    "\n- TYPE: 'course' (Khóa học), 'forum' (Bài viết/Thread), 'category' (Chuyên mục diễn đàn), 'contributor' (Thành viên đóng góp)." +
                    "\n- id: SLUG khóa học (nếu là course), ID bài viết (nếu là forum), ID chuyên mục (nếu là category), ID tài khoản thành viên (nếu là contributor)." +
                    "\n- title: Tiêu đề khóa học, tiêu đề bài viết, tên chuyên mục, hoặc tên đầy đủ thành viên." +
                    "\n- info: Giá tiền kèm đơn vị (nếu là course), số lượt thích (nếu là forum, ví dụ: '15 likes'), tên 'Diễn đàn' (nếu là category), tổng số lượt thích (nếu là contributor, ví dụ: '45 likes')." +
                    "\n- author: Giảng viên (nếu là course), tên tác giả (nếu là forum), 'Gnostica' (nếu là category), email thành viên (nếu là contributor)." +
                    "\n- category: Tên danh mục (ví dụ: 'Lập trình', 'Diễn đàn', 'Thành viên nổi bật')." +
                    "\n- imageUrl: Ảnh thumbnail (nếu là course/forum, nếu không có ảnh thì để chữ 'none'). Với category và contributor, luôn để là 'none'." +
                    "\n\nVí dụ định dạng:" +
                    "\n- Khóa học: `[[CARD:course|<slug_khóa_học>|<tiêu_đề_khóa_học>|<giá_tiền>|<giảng_viên>|<danh_mục>|<link_ảnh_thumbnail>]]`" +
                    "\n- Bài viết: `[[CARD:forum|<id_bài_viết>|<tiêu_đề_bài_viết>|<số_lượt_thích>|<tên_tác_giả>|<chuyên_mục>|<link_ảnh>]]`" +
                    "\n- Chuyên mục: `[[CARD:category|<id_chuyên_mục>|<tên_chuyên_mục>|Diễn đàn|Gnostica|Chuyên mục|none]]`" +
                    "\n- Người đóng góp: `[[CARD:contributor|<id_thành_viên>|<tên_thành_viên>|<số_likes>|<email_thành_viên>|Thành viên nổi bật|none]]`" +
                    "\nNếu không có link ảnh thì để là chữ `none` ở trường imageUrl. Không được tự ý viết text thông thường cho danh sách.");
            currentMessages.add(0, systemMap);
        }

        // Vòng lặp function calling (tối đa 3 lần để tránh lặp vô hạn)
        int maxAttempts = 3;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("messages", currentMessages);
            body.put("tools", getAiTools());
            body.put("max_tokens", 2000);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        
                        // Check if AI wants to call a tool
                        if (message.containsKey("tool_calls") && message.get("tool_calls") != null) {
                            currentMessages.add(message); // Quan trọng: Phải đưa thông điệp gọi hàm vào lịch sử

                            List<Map<String, Object>> toolCalls = (List<Map<String, Object>>) message.get("tool_calls");
                            for (Map<String, Object> toolCall : toolCalls) {
                                String toolCallId = (String) toolCall.get("id");
                                Map<String, Object> function = (Map<String, Object>) toolCall.get("function");
                                String funcName = (String) function.get("name");
                                String arguments = (String) function.get("arguments"); // Chuỗi Json

                                String result = executeTool(funcName, arguments);

                                Map<String, Object> toolMessage = new HashMap<>();
                                toolMessage.put("role", "tool");
                                toolMessage.put("tool_call_id", toolCallId);
                                toolMessage.put("name", funcName);
                                toolMessage.put("content", result);
                                currentMessages.add(toolMessage);
                            }
                            // Tiếp tục vòng lặp để gửi lại json kết quả cho AI xử lý 
                            continue;
                        }

                        // Nếu không gọi hàm, đọc tin nhắn text trả về
                        String content = (String) message.get("content");
                        String role = (String) message.get("role");
                        if (content == null || content.trim().isEmpty()) {
                            content = "Tôi xin lỗi, tôi không nhận được phản hồi từ máy chủ AI lúc này. Vui lòng thử hỏi lại.";
                        }
                        return new AiChatResponse(content, role);
                    }
                }
            } catch (Exception e) {
                log.error("Error calling OpenRouter API: {}", e.getMessage(), e);
                return new AiChatResponse("Xin lỗi, tôi gặp sự cố khi kết nối với máy chủ AI. Chi tiết lỗi: " + e.getMessage(), "assistant");
            }
            break;
        }

        return new AiChatResponse("Tôi đã phân tích xong nhưng không thể tổng hợp kết quả lúc này.", "assistant");
    }

    private String executeTool(String functionName, String arguments) {
        log.info("AI is calling tool: {} with args: {}", functionName, arguments);
        try {
            switch (functionName) {
                case "get_top_liked_threads":
                    List<Thread> topThreads = threadRepository.findTop5ByStatusTrueOrderByLikesDesc();
                    return buildThreadResponse(topThreads);

                case "get_top_contributors":
                    List<Object[]> contributors = threadRepository.findTopContributors(PageRequest.of(0, 5));
                    StringBuilder sb = new StringBuilder("Top 5 người đóng góp (đăng nhiều lượt tương tác nhất):\n");
                    for (Object[] row : contributors) {
                        com.gnostica.model.Account account = (com.gnostica.model.Account) row[0];
                        Long totalLikes = (Long) row[1]; // SUM returns Long
                        sb.append(String.format("- Tác giả: %s (Email: %s, ID: %d) có tổng %d likes\n", account.getFullName(), account.getEmail(), account.getId(), totalLikes));
                    }
                    return sb.toString();

                case "get_forum_categories":
                    List<ForumCategory> categories = forumCategoryRepository.findAll();
                    StringBuilder catSb = new StringBuilder("Các chuyên mục trên diễn đàn:\n");
                    for (ForumCategory fc : categories) {
                        catSb.append(String.format("- Tên: %s (ID: %d)\n", fc.getName(), fc.getId()));
                    }
                    return catSb.toString();

                case "get_threads_by_category":
                    Map<String, Object> threadArgs = objectMapper.readValue(arguments, Map.class);
                    String categoryName = (String) threadArgs.get("categoryName");
                    if (categoryName == null || categoryName.trim().isEmpty()) {
                        return "Lỗi: categoryName không hợp lệ.";
                    }
                    List<ForumCategory> allCats = forumCategoryRepository.findAll();
                    ForumCategory matchedCat = null;
                    for (ForumCategory fc : allCats) {
                        if (fc.getName().toLowerCase().contains(categoryName.toLowerCase()) ||
                            categoryName.toLowerCase().contains(fc.getName().toLowerCase())) {
                            matchedCat = fc;
                            break;
                        }
                    }
                    if (matchedCat == null) {
                        return "DATABASE_EMPTY: Không tìm thấy chủ đề nào phù hợp với tên: " + categoryName;
                    }
                    List<Thread> categoryThreads = threadRepository.findTop5ByCategoryIdAndStatusTrueOrderByLikesDesc(matchedCat.getId());
                    return buildThreadResponse(categoryThreads);

                case "search_courses":
                    Map<String, Object> courseArgs = objectMapper.readValue(arguments, Map.class);
                    String courseCategory = (String) courseArgs.get("category");
                    Double maxPrice = courseArgs.get("maxPrice") != null ? Double.valueOf(courseArgs.get("maxPrice").toString()) : null;
                    List<Course> searchedCourses = courseRepository.findCoursesByCategoryAndPrice(courseCategory, maxPrice, PageRequest.of(0, 5));
                    return buildCourseResponse(searchedCourses);

                default:
                    return "Tool không tồn tại.";
            }
        } catch (Exception e) {
            log.error("Error executing tool: ", e);
            return "Lỗi khi thực thi truy vấn DB. Hãy thông báo cho người dùng biết sự cố này.";
        }
    }

    private String buildThreadResponse(List<Thread> threads) {
        if (threads.isEmpty()) return "DATABASE_EMPTY: Không tìm thấy bài viết nào phù hợp trong diễn đàn.";
        StringBuilder sb = new StringBuilder();
        for (Thread t : threads) {
            // Clean content: remove HTML tags and normalize spaces
            String plainContent = t.getContent() != null 
                ? t.getContent().replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim() 
                : "Không có nội dung";
            
            // Create title: first 50 chars
            String derivedTitle = plainContent.length() > 50 
                ? plainContent.substring(0, 50) + "..." 
                : plainContent;

            // Create preview: first 200 chars
            String contentPreview = plainContent.length() > 200 
                ? plainContent.substring(0, 200) + "..." 
                : plainContent;
            
            String imageUrl = "none";
            if (t.getImages() != null && !t.getImages().isEmpty()) {
                imageUrl = t.getImages().get(0).getImageUrl();
            }

            sb.append(String.format("ID Bài viết: %d\n", t.getId()));
            sb.append(String.format("Tiêu đề: %s\n", derivedTitle));
            sb.append(String.format("Nội dung tóm tắt: %s\n", contentPreview));
            sb.append(String.format("Lượt thích (Likes): %d\n", t.getLikes()));
            sb.append(String.format("Tác giả: %s\n", t.getAccount() != null ? t.getAccount().getFullName() : "Ẩn danh"));
            sb.append(String.format("Mục chuyên đề: %s\n", t.getCategory() != null ? t.getCategory().getName() : "Không rõ"));
            sb.append(String.format("Ảnh: %s\n", imageUrl));
            sb.append("---\n");
        }
        return sb.toString();
    }

    private String buildCourseResponse(List<Course> courses) {
        if (courses.isEmpty()) return "DATABASE_EMPTY: Không tìm thấy khóa học nào phù hợp trong hệ thống.";
        StringBuilder sb = new StringBuilder();
        for (Course c : courses) {
            sb.append(String.format("Khóa học Slug: %s\n", c.getSlug()));
            sb.append(String.format("Tiêu đề: %s\n", c.getTitle()));
            sb.append(String.format("Giá: %.0f VNĐ (Giảm giá %d%%)\n", c.getPrice(), c.getDiscount()));
            sb.append(String.format("Tác giả: %s\n", c.getInstructorName()));
            sb.append(String.format("Danh mục: %s\n", c.getCategoryName()));
            sb.append(String.format("Ảnh: %s\n", c.getThumbnail()));
            sb.append("---\n");
        }
        return sb.toString();
    }

    private List<Map<String, Object>> getAiTools() {
        return Arrays.asList(
            createTool("get_top_liked_threads", "Lấy top 5 bài viết có nhiều lượt thích (like) nhất trong diễn đàn.", Collections.emptyMap()),
            createTool("get_top_contributors", "Lấy thông tin những người dùng đăng bài nhiều nhất hoặc nhận được tổng số like cao nhất.", Collections.emptyMap()),
            createTool("get_forum_categories", "Xem danh sách các chủ đề (categories) của diễn đàn hiện đang có để biết người dùng đang quan tâm điều gì.", Collections.emptyMap()),
            createTool(
                "get_threads_by_category", 
                "Lấy danh sách tối đa 5 bài viết mới nhất thuộc một chuyên mục (category) cụ thể bằng tên chuyên mục (ví dụ: 'Hỏi đáp lập trình', 'Chia sẻ kinh nghiệm').", 
                Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "categoryName", Map.of("type", "string", "description", "Tên của chuyên mục cần lấy bài viết (ví dụ: 'Hỏi đáp lập trình', 'Chia sẻ kinh nghiệm').")
                    ),
                    "required", List.of("categoryName")
                )
            ),

            createTool(
                "search_courses", 
                "Tìm kiếm khóa học theo tên danh mục (ví dụ: Java, Web,...) và/hoặc theo giá tối đa.", 
                Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "category", Map.of("type", "string", "description", "Tên danh mục khóa học cần tìm."),
                        "maxPrice", Map.of("type", "number", "description", "Giá tối đa của khóa học.")
                    )
                )
            )
        );
    }

    private Map<String, Object> createTool(String name, String description, Map<String, Object> parameters) {
        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "function");
        
        Map<String, Object> function = new HashMap<>();
        function.put("name", name);
        function.put("description", description);
        if(!parameters.isEmpty()){
            function.put("parameters", parameters);
        } else {
             Map<String, Object> emptyParams = new HashMap<>();
             emptyParams.put("type", "object");
             emptyParams.put("properties", new HashMap<String, Object>());
             function.put("parameters", emptyParams);
        }
        
        tool.put("function", function);
        return tool;
    }
}
