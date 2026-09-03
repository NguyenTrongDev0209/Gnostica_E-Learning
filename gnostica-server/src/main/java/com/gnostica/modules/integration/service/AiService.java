package com.gnostica.modules.integration.service;

import com.gnostica.modules.integration.dto.request.AiChatRequest;

import com.gnostica.modules.integration.dto.response.AiChatResponse;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Topic;
import com.gnostica.core.model.Thread;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Account;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.TopicRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CategoryRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.ReviewRepository;
import com.gnostica.modules.integration.model.mongo.ChatSession;
import com.gnostica.modules.integration.repository.mongo.ChatSessionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${app.public-url}")
    private String publicUrl;

    private final RestTemplate restTemplate;
    private final ThreadRepository threadRepository;
    private final TopicRepository topicRepository;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final AccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final SupportTicketService supportTicketService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${deepseek.api-key:}")
    private String apiKey;

    @Value("${deepseek.base-url:https://api.deepseek.com/v1}")
    private String baseUrl;

    @Value("${deepseek.model:deepseek-v4-flash}")
    private String model;

    public AiChatResponse getChatResponse(AiChatRequest request) {
        return getChatResponse(request, null);
    }

    public AiChatResponse getChatResponse(AiChatRequest request, String accountId) {
        ChatSession session = null;
        boolean useMongo = false;

        try {
            if (request.getSessionId() != null && !request.getSessionId().trim().isEmpty()) {
                session = chatSessionRepository.findById(request.getSessionId()).orElse(null);
            }

            if (session == null) {
                String title = "New Chat";
                if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
                    String msg = request.getMessage().trim();
                    title = msg.length() > 30 ? msg.substring(0, 30) + "..." : msg;
                } else if (request.getMessages() != null && !request.getMessages().isEmpty()) {
                    String msg = request.getMessages().get(request.getMessages().size() - 1).getContent();
                    if (msg != null) {
                        title = msg.length() > 30 ? msg.substring(0, 30) + "..." : msg;
                    }
                }

                session = ChatSession.builder()
                        .id(UUID.randomUUID().toString())
                        .accountId(accountId)
                        .title(title)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .messages(new ArrayList<>())
                        .build();
            }
            useMongo = true;
        } catch (Exception e) {
            log.error("MongoDB not available, falling back to stateless chat", e);
        }

        List<Map<String, Object>> currentMessages = new ArrayList<>();

        Map<String, Object> systemMap = new HashMap<>();
        systemMap.put("role", "system");
        systemMap.put("content", buildSystemPrompt(accountId));
        currentMessages.add(systemMap);

        if (useMongo && session != null && session.getMessages() != null) {
            for (ChatSession.ChatMessage msg : session.getMessages()) {
                Map<String, Object> map = new HashMap<>();
                map.put("role", msg.getRole());
                map.put("content", msg.getContent());
                currentMessages.add(map);
            }
        }

        String newUserContent = null;
        if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
            newUserContent = request.getMessage().trim();
        } else if (request.getMessages() != null && !request.getMessages().isEmpty()) {
            newUserContent = request.getMessages().get(request.getMessages().size() - 1).getContent();
        }

        if (newUserContent != null) {
            String trimmedMsg = newUserContent.trim();
            boolean isFaq = false;
            AiChatResponse faqResponse = null;

            if ("Xem các bài viết nổi bật".equalsIgnoreCase(trimmedMsg)) {
                List<Thread> topThreads = threadRepository.findTop5ByStatusOrderByViewCountDesc(2);
                StringBuilder sb = new StringBuilder("Dưới đây là các bài viết nổi bật nhất trên diễn đàn:\n\n");
                for (Thread t : topThreads) {
                    String author = t.getAccount() != null ? t.getAccount().getFullName() : "Ẩn danh";
                    String category = t.getTopic() != null ? t.getTopic().getTitle() : "Không rõ";
                    String title = cleanHtml(t.getTitle() != null ? t.getTitle() : "Không có tiêu đề");
                    String slug = t.getSlug() != null ? t.getSlug() : String.valueOf(t.getId());
                    sb.append(String.format("[[CARD:forum|%s|%s|%d|%s|%s|none]]\n", slug, title, t.getViewCount(),
                            author, category));
                }
                faqResponse = new AiChatResponse(sb.toString(), "assistant");
                isFaq = true;
            } else if ("Các khóa học nổi tiếng".equalsIgnoreCase(trimmedMsg)
                    || "Khóa học nổi tiếng".equalsIgnoreCase(trimmedMsg)
                    || "Các khóa học nổi bật".equalsIgnoreCase(trimmedMsg)
                    || "Khóa học nổi bật".equalsIgnoreCase(trimmedMsg)) {
                faqResponse = new AiChatResponse(getPopularCoursesByTopCategories(), "assistant");
                isFaq = true;
            } else if ("Khóa học xem nhiều nhất".equalsIgnoreCase(trimmedMsg)
                    || "Các khóa học xem nhiều nhất".equalsIgnoreCase(trimmedMsg)
                    || "Khóa học nhiều học viên nhất".equalsIgnoreCase(trimmedMsg)) {
                faqResponse = new AiChatResponse(getMostEnrolledCourses(), "assistant");
                isFaq = true;
            } else if ("Tìm kiếm khóa học Java".equalsIgnoreCase(trimmedMsg)) {
                List<Course> searchedCourses = courseRepository.findCoursesByCategoryAndPrice("Java", null,
                        PageRequest.of(0, 5));
                StringBuilder sb = new StringBuilder("Dưới đây là các khóa học Java trong hệ thống:\n\n");
                for (Course c : searchedCourses) {
                    String author = c.getAccount() != null ? c.getAccount().getFullName() : "Không rõ";
                    String categoryName = c.getCategory() != null ? c.getCategory().getName() : "Không rõ";
                    String title = cleanHtml(c.getTitle() != null ? c.getTitle() : "Không có tiêu đề");
                    String priceStr = String.format("%.0fđ", c.getPrice() != null ? c.getPrice().doubleValue() : 0.0);
                    String thumbnail = c.getThumbnail() != null && !c.getThumbnail().isEmpty() ? c.getThumbnail()
                            : "none";
                    sb.append(String.format("[[CARD:course|%s|%s|%s|%s|%s|%s]]\n", c.getSlug(), title, priceStr, author,
                            categoryName, thumbnail));
                }
                faqResponse = new AiChatResponse(sb.toString(), "assistant");
                isFaq = true;
            } else if ("Thành viên đóng góp tích cực nhất".equalsIgnoreCase(trimmedMsg)) {
                List<Object[]> contributors = threadRepository.findTopContributors(PageRequest.of(0, 5));
                StringBuilder sb = new StringBuilder(
                        "Dưới đây là những người đóng góp tích cực nhất trên diễn đàn:\n\n");
                for (Object[] row : contributors) {
                    com.gnostica.core.model.Account account = (com.gnostica.core.model.Account) row[0];
                    Long totalThreads = (Long) row[1];
                    String author = account.getFullName();
                    sb.append(String.format("[[CARD:contributor|%s|%s|%d bài viết|%s|Thành viên|none]]\n",
                            account.getId().toString(), author, totalThreads, author));
                }
                faqResponse = new AiChatResponse(sb.toString(), "assistant");
                isFaq = true;
            } else if ("Chuyên mục thảo luận diễn đàn".equalsIgnoreCase(trimmedMsg)) {
                List<Topic> categories = topicRepository.findAll();
                StringBuilder sb = new StringBuilder("Dưới đây là các chuyên mục thảo luận trên diễn đàn:\n\n");
                for (Topic fc : categories) {
                    sb.append(String.format("[[CARD:category|%d|%s|Xem chuyên mục|Diễn đàn|Gnostica|none]]\n",
                            fc.getId(), fc.getTitle()));
                }
                faqResponse = new AiChatResponse(sb.toString(), "assistant");
                isFaq = true;
            } else if ("Yêu cầu hỗ trợ".equalsIgnoreCase(trimmedMsg) || "Tôi cần hỗ trợ".equalsIgnoreCase(trimmedMsg)) {
                if (accountId == null || accountId.trim().isEmpty()) {
                    String resp = "Vui lòng đăng nhập tài khoản để gửi Yêu cầu hỗ trợ tới Admin.";
                    faqResponse = new AiChatResponse(resp, "assistant");
                    isFaq = true;
                } else {
                    String resp = "Chào bạn! Bạn đang gặp sự cố hoặc cần hỗ trợ về vấn đề gì? Hãy mô tả ngắn gọn sự cố và có thể đính kèm ảnh chụp màn hình minh chứng bên dưới để chúng tôi gửi yêu cầu tới Admin ngay nhé!\n\n[[CARD:upload_image]]";
                    faqResponse = new AiChatResponse(resp, "assistant");
                    isFaq = true;
                }
            }

            if (isFaq) {
                if (useMongo && session != null) {
                    final ChatSession faqSession = session;
                    final String faqMsg = trimmedMsg;
                    final AiChatResponse faqResp = faqResponse;
                    CompletableFuture.runAsync(() -> {
                        saveFaqSession(faqSession, faqMsg, faqResp);
                    });
                    faqResponse.setSessionId(session.getId());
                }
                return faqResponse;
            }
        }

        if (newUserContent != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("role", "user");
            userMap.put("content", newUserContent);
            currentMessages.add(userMap);

            if (useMongo && session != null) {
                session.getMessages().add(ChatSession.ChatMessage.builder()
                        .role("user")
                        .content(newUserContent)
                        .timestamp(LocalDateTime.now())
                        .build());
            }
        } else if (!useMongo) {
            if (request.getMessages() != null) {
                for (AiChatRequest.Message m : request.getMessages()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("role", m.getRole());
                    map.put("content", m.getContent());
                    currentMessages.add(map);
                }
            }
        }

        // Truyền accountId vào context để tools có thể dùng
        AiChatResponse chatResponse;
        try {
            chatResponse = processChatLoop(baseUrl, apiKey, model, currentMessages, accountId);
        } catch (Exception e) {
            log.error("DeepSeek API failed: {}", e.getMessage(), e);
            chatResponse = new AiChatResponse("Dịch vụ AI đang gặp sự cố, vui lòng thử lại trong ít phút.",
                    "assistant");
        }

        if (useMongo && session != null) {
            try {
                session.getMessages().add(ChatSession.ChatMessage.builder()
                        .role(chatResponse.getRole() != null ? chatResponse.getRole() : "assistant")
                        .content(chatResponse.getContent())
                        .timestamp(LocalDateTime.now())
                        .build());
                session.setUpdatedAt(LocalDateTime.now());

                if ("New Chat".equals(session.getTitle()) && newUserContent != null) {
                    session.setTitle(
                            newUserContent.length() > 30 ? newUserContent.substring(0, 30) + "..." : newUserContent);
                }

                final ChatSession sessionToSave = session;
                CompletableFuture.runAsync(() -> {
                    try {
                        chatSessionRepository.save(sessionToSave);
                    } catch (Exception e) {
                        log.error("Async error saving AI response to MongoDB", e);
                    }
                });
                chatResponse.setSessionId(session.getId());
            } catch (Exception e) {
                log.error("Failed to prepare AI response for MongoDB", e);
            }
        }

        return chatResponse;
    }

    private AiChatResponse processChatLoop(String apiUrl, String key, String modelName,
            List<Map<String, Object>> currentMessages, String accountId) throws Exception {
        String url = apiUrl + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + key);
        headers.set("HTTP-Referer", publicUrl);
        headers.set("X-Title", "Gnostica E-Learning");

        // Vòng lặp function calling (tối đa 5 lần để xử lý đa bước: hỏi -> thu thập ->
        // tạo ticket)
        int maxAttempts = 5;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            Map<String, Object> body = new HashMap<>();
            body.put("model", modelName);
            body.put("messages", currentMessages);
            body.put("tools", getAiTools(accountId));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

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

                            String result = executeTool(funcName, arguments, accountId);

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
                    return new AiChatResponse(content, role);
                }
            }
            break;
        }

        return new AiChatResponse("Tôi đã phân tích xong nhưng không thể tổng hợp kết quả lúc này.", "assistant");
    }

    private String executeTool(String functionName, String arguments, String accountId) {
        log.info("AI is calling tool: {} with args: {}", functionName, arguments);
        try {
            switch (functionName) {
                case "get_top_liked_threads":
                    List<Thread> topThreads = threadRepository.findTop5ByStatusOrderByViewCountDesc(2);
                    return buildThreadResponse(topThreads);

                case "get_top_contributors":
                    List<Object[]> contributors = threadRepository.findTopContributors(PageRequest.of(0, 5));
                    StringBuilder sb = new StringBuilder("Top 5 người đóng góp (đăng nhiều bài viết nhất):\n");
                    for (Object[] row : contributors) {
                        com.gnostica.core.model.Account account = (com.gnostica.core.model.Account) row[0];
                        Long totalThreads = (Long) row[1];
                        sb.append(String.format("- Tác giả: %s (Email: %s, ID: %s) có tổng %d bài viết\n",
                                account.getFullName(), account.getEmail(), account.getId(), totalThreads));
                    }
                    return sb.toString();

                case "get_forum_categories":
                    List<Topic> categories = topicRepository.findAll();
                    StringBuilder catSb = new StringBuilder("Các chuyên mục trên diễn đàn:\n");
                    for (Topic fc : categories) {
                        catSb.append(String.format("- Tên: %s (ID: %d)\n", fc.getTitle(), fc.getId()));
                    }
                    return catSb.toString();

                case "get_threads_by_category":
                    Map<String, Object> threadArgs = objectMapper.readValue(arguments, Map.class);
                    String categoryName = (String) threadArgs.get("categoryName");
                    if (categoryName == null || categoryName.trim().isEmpty()) {
                        return "Lỗi: categoryName không hợp lệ.";
                    }
                    List<Topic> allCats = topicRepository.findAll();
                    Topic matchedCat = null;
                    for (Topic fc : allCats) {
                        if (fc.getTitle().toLowerCase().contains(categoryName.toLowerCase()) ||
                                categoryName.toLowerCase().contains(fc.getTitle().toLowerCase())) {
                            matchedCat = fc;
                            break;
                        }
                    }
                    if (matchedCat == null) {
                        return "DATABASE_EMPTY: Không tìm thấy chủ đề nào phù hợp với tên: " + categoryName;
                    }
                    List<Thread> categoryThreads = threadRepository
                            .findTop5ByTopic_IdAndStatusOrderByViewCountDesc(matchedCat.getId(), 2);
                    return buildThreadResponse(categoryThreads);

                case "search_courses":
                    Map<String, Object> courseArgs = objectMapper.readValue(arguments, Map.class);
                    String courseCategory = (String) courseArgs.get("category");
                    Double maxPrice = courseArgs.get("maxPrice") != null
                            ? Double.valueOf(courseArgs.get("maxPrice").toString())
                            : null;
                    List<Course> searchedCourses = courseRepository.findCoursesByCategoryAndPrice(courseCategory,
                            maxPrice, PageRequest.of(0, 5));
                    return buildCourseResponse(searchedCourses);

                case "get_popular_courses_by_top_categories":
                    return getPopularCoursesByTopCategories();

                case "get_popular_courses_by_category":
                    Map<String, Object> popCatArgs = objectMapper.readValue(arguments, Map.class);
                    String popCategoryName = (String) popCatArgs.get("categoryName");
                    return getPopularCoursesByCategory(popCategoryName);

                case "get_most_enrolled_courses":
                    return getMostEnrolledCourses();

                case "get_most_enrolled_courses_by_category":
                    Map<String, Object> enrolledCatArgs = objectMapper.readValue(arguments, Map.class);
                    String enrolledCategoryName = (String) enrolledCatArgs.get("categoryName");
                    return getMostEnrolledCoursesByCategory(enrolledCategoryName);

                // =====================================================================
                // TOOLS HỖ TRỢ KHÁCH HÀNG
                // =====================================================================

                case "create_support_ticket":
                    if (accountId == null || accountId.trim().isEmpty()) {
                        return "ERROR: Bạn cần đăng nhập để gửi yêu cầu hỗ trợ. Vui lòng đăng nhập và thử lại.";
                    }
                    Map<String, Object> ticketArgs = objectMapper.readValue(arguments, Map.class);
                    String subject = (String) ticketArgs.get("subject");
                    String ticketContent = (String) ticketArgs.get("content");
                    if (subject == null || subject.trim().isEmpty()) {
                        subject = "Yêu cầu hỗ trợ từ học viên";
                    }
                    if (ticketContent == null || ticketContent.trim().isEmpty()) {
                        ticketContent = "Học viên đã gửi yêu cầu hỗ trợ qua Chatbox AI.";
                    }
                    String ticketType = (String) ticketArgs.getOrDefault("type", "GENERAL");
                    int priority = ticketArgs.get("priority") != null
                            ? Integer.parseInt(ticketArgs.get("priority").toString())
                            : 2;
                    String imageUrl = (String) ticketArgs.getOrDefault("imageUrl", null);

                    int ticketId = supportTicketService.createTicket(accountId, subject, ticketContent, ticketType,
                            priority, imageUrl);
                    if (ticketId > 0) {
                        String priorityLabel = priority == 3 ? "Cao" : priority == 2 ? "Trung bình" : "Thấp";
                        String hasImage = (imageUrl != null && !imageUrl.trim().isEmpty()
                                && !"none".equalsIgnoreCase(imageUrl.trim())) ? "Có đính kèm ảnh minh họa." : "";
                        return String.format("TICKET_CREATED|%d|%s|%s|%s|%s",
                                ticketId, subject, ticketType, priorityLabel, hasImage);
                    } else {
                        return "DATABASE_ERROR: Không thể tạo yêu cầu hỗ trợ. Vui lòng thử lại sau.";
                    }

                case "get_my_orders":
                    if (accountId == null || accountId.trim().isEmpty()) {
                        return "ERROR: Bạn cần đăng nhập để xem lịch sử đơn hàng.";
                    }
                    Account orderAccount = accountRepository.findById(UUID.fromString(accountId)).orElse(null);
                    if (orderAccount == null) {
                        return "DATABASE_ERROR: Không tìm thấy thông tin tài khoản.";
                    }
                    List<Order> orders = orderRepository.findByAccountOrderByIdDesc(orderAccount);
                    return buildOrderResponse(orders);

                // =====================================================================
                // TOOLS HỌC TẬP CÁ NHÂN HÓA
                // =====================================================================

                case "get_my_courses":
                    if (accountId == null || accountId.trim().isEmpty()) {
                        return "ERROR: Bạn cần đăng nhập để xem danh sách khóa học của mình.";
                    }
                    Account enrollAccount = accountRepository.findById(UUID.fromString(accountId)).orElse(null);
                    if (enrollAccount == null) {
                        return "DATABASE_ERROR: Không tìm thấy thông tin tài khoản.";
                    }
                    List<Enrollment> enrollments = enrollmentRepository.findByAccount(enrollAccount);
                    return buildEnrollmentResponse(enrollments);

                case "get_my_learning_progress":
                    if (accountId == null || accountId.trim().isEmpty()) {
                        return "ERROR: Bạn cần đăng nhập để xem tiến độ học tập.";
                    }
                    Account progressAccount = accountRepository.findById(UUID.fromString(accountId)).orElse(null);
                    if (progressAccount == null) {
                        return "DATABASE_ERROR: Không tìm thấy thông tin tài khoản.";
                    }
                    List<Enrollment> progressEnrollments = enrollmentRepository.findByAccount(progressAccount);
                    return buildLearningProgressResponse(progressEnrollments);

                default:
                    return "Tool không tồn tại.";
            }
        } catch (Exception e) {
            log.error("Error executing tool: ", e);
            return "DATABASE_ERROR: Hiện tại hệ thống không thể truy vấn thông tin này. Hãy báo với người dùng một cách lịch sự rằng dịch vụ đang gặp sự cố.";
        }
    }

    // =====================================================================
    // BUILD RESPONSES
    // =====================================================================

    public List<String> getTopLikedThreadCards() {
        List<Thread> topThreads = threadRepository.findTop5ByStatusOrderByViewCountDesc(2);
        List<String> cards = new ArrayList<>();
        for (Thread t : topThreads) {
            String author = t.getAccount() != null ? t.getAccount().getFullName() : "Ẩn danh";
            String category = t.getTopic() != null ? t.getTopic().getTitle() : "Không rõ";
            String imgUrl = "none";
            String title = cleanHtml(t.getTitle() != null ? t.getTitle() : "(Không tiêu đề)");
            String slug = t.getSlug() != null ? t.getSlug() : String.valueOf(t.getId());
            String card = String.format("[[CARD:forum|%s|%s|%d|%s|%s|%s]]",
                    slug,
                    title,
                    t.getViewCount(),
                    author,
                    category,
                    imgUrl);
            cards.add(card);
        }
        return cards;
    }

    private String buildThreadResponse(List<Thread> threads) {
        if (threads.isEmpty())
            return "DATABASE_EMPTY: Không tìm thấy bài viết nào phù hợp trong diễn đàn.";
        StringBuilder sb = new StringBuilder();
        for (Thread t : threads) {
            String title = cleanHtml(t.getTitle() != null ? t.getTitle() : "Không có tiêu đề");
            String plainContent = cleanHtml(t.getContent());
            if (plainContent.isEmpty()) {
                plainContent = "Không có nội dung";
            }
            String contentPreview = plainContent.length() > 200
                    ? plainContent.substring(0, 200) + "..."
                    : plainContent;

            sb.append(String.format("ID Bài viết: %d\n", t.getId()));
            sb.append(String.format("Slug Bài viết: %s\n",
                    t.getSlug() != null ? t.getSlug() : String.valueOf(t.getId())));
            sb.append(String.format("Tiêu đề: %s\n", title));
            sb.append(String.format("Nội dung tóm tắt: %s\n", contentPreview));
            sb.append(String.format("Lượt xem (Views): %d\n", t.getViewCount()));
            sb.append(
                    String.format("Tác giả: %s\n", t.getAccount() != null ? t.getAccount().getFullName() : "Ẩn danh"));
            sb.append(
                    String.format("Mục chuyên đề: %s\n", t.getTopic() != null ? t.getTopic().getTitle() : "Không rõ"));
            sb.append(String.format("Ảnh: none\n"));
            sb.append("---\n");
        }
        return sb.toString();
    }

    private String buildCourseResponse(List<Course> courses) {
        if (courses.isEmpty())
            return "DATABASE_EMPTY: Không tìm thấy khóa học nào phù hợp trong hệ thống.";
        StringBuilder sb = new StringBuilder();
        for (Course c : courses) {
            sb.append(String.format("Khóa học Slug: %s\n", c.getSlug()));
            sb.append(String.format("Tiêu đề: %s\n", c.getTitle()));
            sb.append(String.format("Giá: %.0f VNĐ (Giảm giá %d%%)\n",
                    c.getPrice() != null ? c.getPrice().doubleValue() : 0.0, c.getDiscount()));
            sb.append(
                    String.format("Tác giả: %s\n", c.getAccount() != null ? c.getAccount().getFullName() : "Không rõ"));
            sb.append(
                    String.format("Danh mục: %s\n", c.getCategory() != null ? c.getCategory().getName() : "Không rõ"));
            sb.append(String.format("Ảnh: %s\n", c.getThumbnail()));
            sb.append("---\n");
        }
        return sb.toString();
    }

    private String buildOrderResponse(List<Order> orders) {
        if (orders == null || orders.isEmpty()) {
            return "DATABASE_EMPTY: Bạn chưa có đơn hàng nào trong hệ thống.";
        }
        StringBuilder sb = new StringBuilder("Lịch sử đơn hàng của bạn (tối đa 5 đơn gần nhất):\n");
        int count = Math.min(orders.size(), 5);
        for (int i = 0; i < count; i++) {
            Order o = orders.get(i);
            String statusLabel = switch (o.getStatus()) {
                case 1 -> "Chờ thanh toán";
                case 2 -> "Đã thanh toán";
                case 3 -> "Đã huỷ";
                case 4 -> "Đã hoàn tiền";
                default -> "Không xác định";
            };
            sb.append(String.format(
                    "- Đơn hàng #%s | Tổng tiền: %s VNĐ | Phương thức: %s | Trạng thái: %s | Ngày đặt: %s\n",
                    o.getOrderCode() != null ? o.getOrderCode() : o.getId().toString().substring(0, 8).toUpperCase(),
                    o.getTotalPrice().toPlainString(),
                    o.getPaymentMethod(),
                    statusLabel,
                    o.getCreatedAt() != null ? o.getCreatedAt().toLocalDate().toString() : "N/A"));
        }
        return sb.toString();
    }

    private String buildEnrollmentResponse(List<Enrollment> enrollments) {
        if (enrollments == null || enrollments.isEmpty()) {
            return "DATABASE_EMPTY: Bạn chưa tham gia khóa học nào trong hệ thống.";
        }
        StringBuilder sb = new StringBuilder("Danh sách khóa học của bạn:\n");
        for (Enrollment e : enrollments) {
            String courseTitle = e.getCourse() != null ? e.getCourse().getTitle() : "Không rõ";
            String courseSlug = e.getCourse() != null ? e.getCourse().getSlug() : "N/A";
            String statusLabel = switch (e.getStatus()) {
                case 0 -> "Đã huỷ/Hoàn tiền";
                case 1 -> "Đang học";
                case 2 -> "Hoàn thành";
                default -> "Không xác định";
            };
            String thumbnail = (e.getCourse() != null && e.getCourse().getThumbnail() != null)
                    ? e.getCourse().getThumbnail()
                    : "none";
            String author = (e.getCourse() != null && e.getCourse().getAccount() != null)
                    ? e.getCourse().getAccount().getFullName()
                    : "Không rõ";
            String categoryName = (e.getCourse() != null && e.getCourse().getCategory() != null)
                    ? e.getCourse().getCategory().getName()
                    : "Không rõ";
            // Trả về dưới dạng CARD để UI render đẹp
            sb.append(String.format("[[CARD:course|%s|%s|%d%% - %s|%s|%s|%s]]\n",
                    courseSlug, courseTitle, e.getProgressPercent(), statusLabel, author, categoryName, thumbnail));
        }
        return sb.toString();
    }

    private String buildLearningProgressResponse(List<Enrollment> enrollments) {
        if (enrollments == null || enrollments.isEmpty()) {
            return "DATABASE_EMPTY: Bạn chưa tham gia khóa học nào để theo dõi tiến độ.";
        }
        StringBuilder sb = new StringBuilder("Tiến độ học tập của bạn:\n");
        for (Enrollment e : enrollments) {
            if (e.getStatus() == 0)
                continue; // Bỏ qua đã huỷ
            String courseTitle = e.getCourse() != null ? e.getCourse().getTitle() : "Không rõ";
            String statusLabel = e.getStatus() == 2 ? "✅ Hoàn thành" : "📚 Đang học";
            sb.append(String.format("- Khóa học: %s | Tiến độ: %d%% | Trạng thái: %s\n",
                    courseTitle, e.getProgressPercent(), statusLabel));
            if (e.getCompletedAt() != null) {
                sb.append(String.format("  Hoàn thành lúc: %s\n", e.getCompletedAt().toLocalDate()));
            }
        }
        if (sb.toString().equals("Tiến độ học tập của bạn:\n")) {
            return "DATABASE_EMPTY: Không có khóa học nào đang học hoặc đã hoàn thành.";
        }
        return sb.toString();
    }

    // =====================================================================
    // AI TOOLS DEFINITION
    // =====================================================================

    private List<Map<String, Object>> getAiTools(String accountId) {
        List<Map<String, Object>> tools = new ArrayList<>(Arrays.asList(
                // --- Tools công khai (không cần đăng nhập) ---
                createTool("get_top_liked_threads",
                        "Lấy top 5 BÀI VIẾT DIỄN ĐÀN (Forum Threads) có nhiều tương tác nhất. CHỈ DÙNG KHI HỎI VỀ BÀI VIẾT DIỄN ĐÀN, KHÔNG DÙNG CHO KHÓA HỌC.",
                        Collections.emptyMap()),
                createTool("get_top_contributors",
                        "Lấy thông tin những người dùng đăng bài nhiều nhất hoặc nhận được tổng số like cao nhất.",
                        Collections.emptyMap()),
                createTool("get_forum_categories",
                        "Xem danh sách các chủ đề (categories) của diễn đàn hiện đang có để biết người dùng đang quan tâm điều gì.",
                        Collections.emptyMap()),
                createTool(
                        "get_threads_by_category",
                        "Lấy danh sách tối đa 5 bài viết mới nhất thuộc một chuyên mục (category) cụ thể bằng tên chuyên mục.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "categoryName",
                                        Map.of("type", "string", "description",
                                                "Tên của chuyên mục cần lấy bài viết.")),
                                "required", List.of("categoryName"))),
                createTool(
                        "search_courses",
                        "Tìm kiếm khóa học theo tên danh mục (ví dụ: Java, Web,...) và/hoặc theo giá tối đa.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "category",
                                        Map.of("type", "string", "description", "Tên danh mục khóa học cần tìm."),
                                        "maxPrice",
                                        Map.of("type", "number", "description", "Giá tối đa của khóa học.")))),
                createTool(
                        "get_popular_courses_by_top_categories",
                        "Lấy Top 3 chủ đề (danh mục) có nhiều khóa học nhất, và trong từng chủ đề lấy Top 3 khóa học nổi tiếng/nổi bật có rating cao nhất. Dùng khi người dùng hỏi 'các khóa học nổi tiếng', 'khóa học nổi bật', 'khóa học hot'.",
                        Collections.emptyMap()),
                createTool(
                        "get_popular_courses_by_category",
                        "Lấy Top 5 khóa học nổi tiếng/nổi bật có rating cao nhất thuộc một chủ đề cụ thể (như Java, Web, Python,...). Dùng khi người dùng hỏi 'khóa học [Tên chủ đề] nổi tiếng', 'khóa học [Tên chủ đề] nổi bật'.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "categoryName",
                                        Map.of("type", "string", "description",
                                                "Tên của chủ đề / danh mục khóa học cần tìm.")),
                                "required", List.of("categoryName"))),
                createTool(
                        "get_most_enrolled_courses",
                        "Lấy Top 5 khóa học xem nhiều nhất / có số lượng học viên tham gia học nhiều nhất toàn hệ thống. Dùng khi người dùng hỏi 'khóa học xem nhiều nhất', 'khóa học nhiều học viên nhất'.",
                        Collections.emptyMap()),
                createTool(
                        "get_most_enrolled_courses_by_category",
                        "Lấy Top 5 khóa học xem nhiều nhất / có số lượng học viên tham gia học nhiều nhất thuộc một chủ đề cụ thể. Dùng khi người dùng hỏi 'khóa học [Tên chủ đề] xem nhiều nhất', 'khóa học [Tên chủ đề] nhiều học viên nhất'.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "categoryName",
                                        Map.of("type", "string", "description",
                                                "Tên của chủ đề / danh mục khóa học cần tìm.")),
                                "required", List.of("categoryName"))),
                // --- Tool hỗ trợ khách hàng (yêu cầu đăng nhập) ---
                createTool(
                        "create_support_ticket",
                        "Tạo yêu cầu hỗ trợ kỹ thuật gửi đến Admin. Chỉ gọi sau khi đã hỏi và thu thập đầy đủ thông tin mô tả vấn đề từ người dùng.",
                        Map.of(
                                "type", "object",
                                "properties", Map.of(
                                        "subject",
                                        Map.of("type", "string", "description",
                                                "Tiêu đề ngắn tóm tắt sự cố (ví dụ: 'Video bài 3 không tải được')."),
                                        "content",
                                        Map.of("type", "string", "description",
                                                "Mô tả chi tiết sự cố do người dùng cung cấp."),
                                        "type",
                                        Map.of("type", "string", "description",
                                                "Phân loại: TECHNICAL_ISSUE (lỗi kỹ thuật), PAYMENT_ERROR (lỗi thanh toán), COURSE_ACCESS (không vào được khóa học), GENERAL (chung)."),
                                        "priority",
                                        Map.of("type", "integer", "description",
                                                "Độ ưu tiên: 1 (Thấp), 2 (Trung bình), 3 (Cao)."),
                                        "imageUrl",
                                        Map.of("type", "string", "description",
                                                "URL ảnh đính kèm minh họa sự cố. Để trống nếu người dùng không cung cấp.")),
                                "required", List.of("subject", "content", "type", "priority"))),
                createTool(
                        "get_my_orders",
                        "Lấy lịch sử đơn hàng và trạng thái thanh toán của người dùng hiện tại. Dùng khi người dùng hỏi về đơn hàng hoặc trạng thái thanh toán.",
                        Collections.emptyMap())));

        // Tools cá nhân hóa - chỉ thêm khi người dùng đã đăng nhập
        if (accountId != null && !accountId.trim().isEmpty()) {
            tools.add(createTool(
                    "get_my_courses",
                    "Lấy danh sách các khóa học mà người dùng hiện tại đã đăng ký. Dùng khi người dùng hỏi 'khóa học của tôi', 'tôi đang học gì'.",
                    Collections.emptyMap()));
            tools.add(createTool(
                    "get_my_learning_progress",
                    "Lấy tiến độ học tập (% hoàn thành, trạng thái) của từng khóa học mà người dùng đang học. Dùng khi người dùng hỏi 'tôi học đến đâu rồi', 'tiến độ của tôi'.",
                    Collections.emptyMap()));
        }

        return tools;
    }

    // Giữ tương thích ngược với các nơi gọi không truyền accountId
    private List<Map<String, Object>> getAiTools() {
        return getAiTools(null);
    }

    private Map<String, Object> createTool(String name, String description, Map<String, Object> parameters) {
        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "function");

        Map<String, Object> function = new HashMap<>();
        function.put("name", name);
        function.put("description", description);
        if (!parameters.isEmpty()) {
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

    // =====================================================================
    // SYSTEM PROMPT BUILDER
    // =====================================================================

    private String buildSystemPrompt(String accountId) {
        boolean isLoggedIn = accountId != null && !accountId.trim().isEmpty();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là Gnostica AI - trợ lý học tập thông minh của nền tảng Gnostica E-Learning. ");
        prompt.append(
                "Bạn có thể truy cập database để tìm khóa học, bài viết, hỗ trợ kỹ thuật và theo dõi tiến độ học tập.");

        prompt.append("\n\n### QUY TẮC PHẠM VI NỘI DUNG VÀ AN TOÀN (BẮT BUỘC TUÂN THỦ STRICTLY):");
        prompt.append("\n1. CHỈ TRẢ LỜI CÁC CHỦ ĐỀ LIÊN QUAN ĐẾN HỌC TẬP VÀ BÀI VIẾT DIỄN ĐÀN:");
        prompt.append(
                "\n   - Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan trực tiếp đến Chủ đề học tập (khóa học, bài học, kiến thức lập trình/công nghệ, tiến độ học tập, đơn hàng) và Chủ đề bài viết (diễn đàn, các bài đăng thảo luận, thông tin chuyên mục trên Gnostica E-Learning).");
        prompt.append("\n2. TUYỆT ĐỐI KHÔNG TRẢ LỜI CÁC CHỦ ĐỀ NGOÀI LỀ NỀN TẢNG:");
        prompt.append(
                "\n   - Nếu người dùng hỏi về bất kỳ chủ đề nào ngoài lề nền tảng (ví dụ: thời tiết, công thức nấu ăn, tin tức thời sự, giải trí, thể thao, game không liên quan, kiến thức đời sống cá nhân...), bạn BẮT BUỘC phải từ chối một cách lịch sự và giải thích rằng: 'Gnostica AI chỉ hỗ trợ giải đáp các câu hỏi liên quan đến Chủ đề học tập và Chủ đề bài viết diễn đàn trên nền tảng Gnostica E-Learning.'");
        prompt.append("\n3. TUYỆT ĐỐI KHÔNG TRẢ LỜI CÂU HỎI SPAM, GÂY QUẤY RỐI, CHỐNG PHÁ, NHẠY CẢM:");
        prompt.append(
                "\n   - Nghiêm cấm trả lời các câu hỏi mang tính chất spam, quấy rối, công kích/xúc phạm, chống phá chính trị, thông tin nhạy cảm, đồi trụy, vi phạm pháp luật hoặc vi phạm thuần phong mỹ tục.");
        prompt.append(
                "\n   - Khi gặp các câu hỏi này, hãy từ chối lịch sự, ngắn gọn và nhắc nhở người dùng quay lại các chủ đề học tập văn minh.");

        prompt.append("\n\n### QUY TẮC BẮT BUỘC:");
        prompt.append(
                "\n1. TUYỆT ĐỐI KHÔNG LẤY DỮ LIỆU GIẢ. Chỉ dùng dữ liệu từ database thông qua tool. Nếu không tìm thấy, báo rõ ràng.");
        prompt.append(
                "\n2. TUYỆT ĐỐI KHÔNG TỰ VIẾT LẠI KHÓA HỌC THÀNH DẠNG VĂN BẢN (TEXT/BULLET POINTS DẠNG `- **Tên** - Giá...`). BẮT BUỘC PHẢI IN RA CHÍNH XÁC THẺ CARD `[[CARD:course|slug|Tiêu đề|Giá|Tác giả|Danh mục|URL ảnh]]` ĐỂ GIAO DIỆN HIỂN THỊ NÚT CARD CLICK ĐƯỢC.");
        prompt.append(
                "\n3. NẾU TOOL TRẢ VỀ CÁC THẺ `[[CARD:course|...]]`, BẠN PHẢI GIỮ NGUYÊN VÀ IN TẤT CẢ CÁC THẺ ĐÓ RA TRONG CÂU TRẢ LỜI, KHÔNG ĐƯỢC BỎ BỚT HAY CHUYỂN THÀNH TEXT THƯỜNG.");
        prompt.append("\n4. KHÔNG trả lời bằng khoảng trắng hoặc tin nhắn trống.");
        prompt.append(
                "\n5. NẾU kết quả trả về 'DATABASE_EMPTY' hoặc 'DATABASE_ERROR': Thông báo lịch sự, không bịa dữ liệu.");
        prompt.append(
                "\n6. TUYỆT ĐỐI KHÔNG DÙNG CÁC KÝ TỰ FORMAT MARKDOWN NHƯ '#', '##', '###', '**', '*', '_' TRONG CÂU TRẢ LỜI VĂN BẢN. Chỉ dùng văn bản thuần túy và thẻ Card.");

        prompt.append("\n\n### ĐỊNH DẠNG CARD (BẮT BUỘC DÙNG DẠNG NÀY ĐỂ CLICK ĐƯỢC KHÓA HỌC):");
        prompt.append("\n- TYPE 'course': `[[CARD:course|slug|Tiêu đề|Giá|Tác giả|Danh mục|URL ảnh]]`");
        prompt.append("\n- TYPE 'forum': `[[CARD:forum|slug|Tiêu đề|Lượt xem|Tác giả|Chuyên mục|none]]`");
        prompt.append("\n- TYPE 'category': `[[CARD:category|id|Tên|Mô tả|Diễn đàn|Gnostica|none]]`");
        prompt.append("\n- TYPE 'contributor': `[[CARD:contributor|id|Tên|Số bài|Tên|Thành viên|none]]`");
        prompt.append("\n- TYPE 'ticket': `[[CARD:ticket|ticketId|subject|Loại|Mức ưu tiên|Ngày]]`");

        prompt.append("\n\n### HỎI VỀ KHÓA HỌC NỔI BẬT / XEM NHIỀU NHẤT:");
        prompt.append(
                "\n- Khi hỏi 'Khóa học nổi tiếng', 'Khóa học nổi bật': Gọi tool `get_popular_courses_by_top_categories`.");
        prompt.append(
                "\n- Khi hỏi 'Khóa học nổi tiếng/nổi bật' + 'Chủ đề': Gọi tool `get_popular_courses_by_category` truyền tên chủ đề.");
        prompt.append(
                "\n- Khi hỏi 'Khóa học xem nhiều nhất', 'Khóa học nhiều học viên nhất': Gọi tool `get_most_enrolled_courses`.");
        prompt.append(
                "\n- Khi hỏi 'Khóa học xem nhiều nhất' + 'Chủ đề': Gọi tool `get_most_enrolled_courses_by_category` truyền tên chủ đề.");

        prompt.append("\n\n### PHÂN BIỆT KHÓA HỌC VÀ BÀI VIẾT DIỄN ĐÀN:");
        prompt.append(
                "\n- Khi người dùng hỏi về KHÓA HỌC ('Khóa học xem nhiều nhất', 'Khóa học nổi bật', 'Khóa học Java'...): BẮT BUỘC GỌI CÁC TOOL KHÓA HỌC (`get_most_enrolled_courses`, `get_popular_courses_by_top_categories`, `search_courses`). TUYỆT ĐỐI KHÔNG GỌI TOOL BÀI VIẾT DIỄN ĐÀN (`get_top_liked_threads`).");
        prompt.append(
                "\n- CHỈ gọi tool `get_top_liked_threads` khi người dùng hỏi cụ thể về 'Bài viết diễn đàn', 'Bài viết hot', 'Diễn đàn'.");

        prompt.append("\n\n### XỬ LÝ HỖ TRỢ KỸ THUẬT (Customer Support):");
        prompt.append("\nKhi người dùng báo gặp sự cố, lỗi, hoặc vấn đề cần hỗ trợ:");
        prompt.append("\n  Bước 1: Hỏi rõ chi tiết vấn đề nếu thông tin chưa rõ.");
        prompt.append(
                "\n  Bước 2: Gợi ý đính kèm ảnh chụp màn hình bằng cách chèn thẻ `[[CARD:upload_image]]` vào tin nhắn của bạn.");
        prompt.append(
                "\n  Bước 3: SAU KHI người dùng tải ảnh hoặc gửi thông điệp yêu cầu hỗ trợ (tin nhắn chứa '(TẠO TICKET NGAY DÙM TÔI)' hoặc 'Tôi đã gửi yêu cầu hỗ trợ'):");
        prompt.append(
                "\n    - BẮT BUỘC GỌI TOOL `create_support_ticket` NGAY LẬP TỨC để tạo ticket hỗ trợ gửi tới Admin.");
        prompt.append(
                "\n    - NẾU chưa có đủ tiêu đề/mô tả trong các câu nói trước, hãy TỰ TẠO tiêu đề tóm tắt (ví dụ: subject='Yêu cầu hỗ trợ từ học viên', content='Học viên đã gửi yêu cầu hỗ trợ qua Chatbox'). TUYỆT ĐỐI KHÔNG ĐƯỢC HỎI LẠI NGƯỜI DÙNG CÂU NÀO KHÁC.");
        prompt.append(
                "\n    - Phản hồi duy nhất tới học viên BẮT BUỘC phải là chính xác chuỗi sau: 'Tôi đã tiếp nhận yêu cầu hỗ trợ của bạn và chuyển đến Admin. Xin vui lòng quay lại sau!'.");

        if (isLoggedIn) {
            prompt.append("\n\n### NGƯỜI DÙNG HIỆN TẠI: Đã đăng nhập (Account ID: ").append(accountId).append(")");
            prompt.append(
                    "\nBạn CÓ THỂ dùng tools: `get_my_courses`, `get_my_learning_progress`, `get_my_orders`, `create_support_ticket`.");
            prompt.append(
                    "\nKhi người dùng hỏi về tiến độ, khóa học của họ, hoặc đơn hàng - hãy gọi tool phù hợp để trả lời chính xác.");
        } else {
            prompt.append("\n\n### NGƯỜI DÙNG HIỆN TẠI: Chưa đăng nhập.");
            prompt.append(
                    "\nNếu người dùng hỏi về khóa học của họ, tiến độ, hay đơn hàng - hãy nhắc đăng nhập để sử dụng tính năng này.");
            prompt.append("\nTool `create_support_ticket` vẫn có thể hỗ trợ nếu người dùng muốn liên hệ admin.");
        }

        return prompt.toString();
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    public String getPopularCoursesByTopCategories() {
        List<Integer> topCategoryIds = courseRepository.findTopCategoryIdsByCourseCount(PageRequest.of(0, 3));
        if (topCategoryIds == null || topCategoryIds.isEmpty()) {
            return "DATABASE_EMPTY: Chưa có dữ liệu về các chủ đề khóa học nổi bật.";
        }
        StringBuilder sb = new StringBuilder(
                "Dưới đây là Top 3 Chủ đề nổi bật nhất và các khóa học được đánh giá cao nhất:\n\n");
        for (Integer catId : topCategoryIds) {
            Category cat = categoryRepository.findById(catId).orElse(null);
            if (cat == null)
                continue;
            sb.append(String.format("📌 Chủ đề: %s\n", cat.getName()));
            List<Course> topCourses = courseRepository.findTopCoursesByRatingAndCategoryId(cat.getId(),
                    PageRequest.of(0, 3));
            if (topCourses == null || topCourses.isEmpty()) {
                sb.append("Chưa có khóa học nào thuộc chủ đề này.\n\n");
            } else {
                for (Course c : topCourses) {
                    sb.append(formatCourseCardWithRating(c));
                }
                sb.append("\n");
            }
        }
        return sb.toString();
    }

    public String getPopularCoursesByCategory(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return "Lỗi: Tên chủ đề không hợp lệ.";
        }
        List<Course> topCourses = courseRepository.findTopCoursesByRatingAndCategoryName(categoryName.trim(),
                PageRequest.of(0, 5));
        if (topCourses == null || topCourses.isEmpty()) {
            return "DATABASE_EMPTY: Không tìm thấy khóa học nổi bật nào thuộc chủ đề '" + categoryName + "'.";
        }
        StringBuilder sb = new StringBuilder(String.format(
                "Dưới đây là Top 5 khóa học nổi bật / đánh giá cao nhất thuộc chủ đề '%s':\n\n", categoryName.trim()));
        for (Course c : topCourses) {
            sb.append(formatCourseCardWithRating(c));
        }
        return sb.toString();
    }

    public String getMostEnrolledCourses() {
        List<Course> topCourses = courseRepository.findTopCoursesByEnrollments(PageRequest.of(0, 5));
        if (topCourses == null || topCourses.isEmpty()) {
            return "DATABASE_EMPTY: Chưa có dữ liệu về khóa học có nhiều học viên nhất.";
        }
        StringBuilder sb = new StringBuilder(
                "Dưới đây là Top 5 khóa học có nhiều học viên tham gia nhất (xem nhiều nhất) toàn hệ thống:\n\n");
        for (Course c : topCourses) {
            sb.append(formatCourseCardWithEnrollments(c));
        }
        return sb.toString();
    }

    public String getMostEnrolledCoursesByCategory(String categoryName) {
        if (categoryName == null || categoryName.trim().isEmpty()) {
            return "Lỗi: Tên chủ đề không hợp lệ.";
        }
        List<Course> topCourses = courseRepository.findTopCoursesByEnrollmentsAndCategoryName(categoryName.trim(),
                PageRequest.of(0, 5));
        if (topCourses == null || topCourses.isEmpty()) {
            return "DATABASE_EMPTY: Không tìm thấy khóa học có nhiều học viên thuộc chủ đề '" + categoryName + "'.";
        }
        StringBuilder sb = new StringBuilder(String.format(
                "Dưới đây là Top 5 khóa học có nhiều học viên tham gia nhất (xem nhiều nhất) thuộc chủ đề '%s':\n\n",
                categoryName.trim()));
        for (Course c : topCourses) {
            sb.append(formatCourseCardWithEnrollments(c));
        }
        return sb.toString();
    }

    private String formatCourseCardWithRating(Course c) {
        String author = (c.getAccount() != null && c.getAccount().getFullName() != null) ? c.getAccount().getFullName()
                : "Không rõ";
        String categoryName = (c.getCategory() != null && c.getCategory().getName() != null) ? c.getCategory().getName()
                : "Không rõ";
        String title = cleanHtml(c.getTitle() != null ? c.getTitle() : "Không có tiêu đề");
        Double avgRating = reviewRepository != null ? reviewRepository.getAverageRatingByCourseId(c.getId()) : 0.0;
        String ratingStr = (avgRating != null && avgRating > 0) ? String.format("⭐ %.1f", avgRating) : "⭐ Mới";
        String priceStr = String.format("%.0fđ (%s)", c.getPrice() != null ? c.getPrice().doubleValue() : 0.0,
                ratingStr);
        String thumbnail = (c.getThumbnail() != null && !c.getThumbnail().isEmpty()) ? c.getThumbnail() : "none";
        return String.format("[[CARD:course|%s|%s|%s|%s|%s|%s]]\n", c.getSlug(), title, priceStr, author, categoryName,
                thumbnail);
    }

    private String formatCourseCardWithEnrollments(Course c) {
        String author = (c.getAccount() != null && c.getAccount().getFullName() != null) ? c.getAccount().getFullName()
                : "Không rõ";
        String categoryName = (c.getCategory() != null && c.getCategory().getName() != null) ? c.getCategory().getName()
                : "Không rõ";
        String title = cleanHtml(c.getTitle() != null ? c.getTitle() : "Không có tiêu đề");
        long studentCount = enrollmentRepository != null ? enrollmentRepository.countByCourseId(c.getId()) : 0;
        String studentStr = String.format("👥 %d học viên", studentCount);
        String priceStr = String.format("%.0fđ (%s)", c.getPrice() != null ? c.getPrice().doubleValue() : 0.0,
                studentStr);
        String thumbnail = (c.getThumbnail() != null && !c.getThumbnail().isEmpty()) ? c.getThumbnail() : "none";
        return String.format("[[CARD:course|%s|%s|%s|%s|%s|%s]]\n", c.getSlug(), title, priceStr, author, categoryName,
                thumbnail);
    }

    private String cleanHtml(String html) {
        if (html == null) {
            return "";
        }
        String cleaned = html.replaceAll("<[^>]*>", " ");
        cleaned = cleaned.replaceAll("(?i)&nbsp;", " ")
                .replaceAll("(?i)&amp;", "&")
                .replaceAll("(?i)&lt;", "<")
                .replaceAll("(?i)&gt;", ">")
                .replaceAll("(?i)&quot;", "\"")
                .replaceAll("(?i)&#39;", "'")
                .replaceAll("(?i)&apos;", "'");
        cleaned = cleaned.replaceAll("\\s+", " ").trim();
        return cleaned;
    }

    private void saveFaqSession(ChatSession session, String userMsg, AiChatResponse assistantResp) {
        try {
            session.getMessages().add(ChatSession.ChatMessage.builder()
                    .role("user")
                    .content(userMsg)
                    .timestamp(LocalDateTime.now())
                    .build());
            session.getMessages().add(ChatSession.ChatMessage.builder()
                    .role("assistant")
                    .content(assistantResp.getContent())
                    .timestamp(LocalDateTime.now())
                    .build());
            session.setUpdatedAt(LocalDateTime.now());
            if ("New Chat".equals(session.getTitle())) {
                session.setTitle(userMsg.length() > 30 ? userMsg.substring(0, 30) + "..." : userMsg);
            }
            chatSessionRepository.save(session);
            assistantResp.setSessionId(session.getId());
        } catch (Exception e) {
            log.error("Failed to save FAQ response to MongoDB", e);
        }
    }
}
