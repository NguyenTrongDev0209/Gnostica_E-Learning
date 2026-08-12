package com.gnostica.modules.messaging.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.model.*;
import com.gnostica.core.model.enums.ParticipantRole;
import com.gnostica.modules.messaging.dto.request.CreateConversationRequest;
import com.gnostica.modules.messaging.dto.request.MarkConversationReadRequest;
import com.gnostica.modules.messaging.dto.request.SendMessageRequest;
import com.gnostica.modules.messaging.dto.response.ConversationDetailResponse;
import com.gnostica.modules.messaging.dto.response.MessageResponse;
import com.gnostica.modules.messaging.service.MessagingConversationService;
import com.gnostica.modules.messaging.service.MessagingMessageService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Testcontainers
@Transactional
class MessagingControllerTests {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("gnostica_test_db")
            .withUsername("test_user")
            .withPassword("test_password");

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
    }

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private MessagingConversationService conversationService;

    @Autowired
    private MessagingMessageService messageService;

    private MockMvc mockMvc;

    private Role studentRole;
    private Role instructorRole;
    private Account studentAccount;
    private Account instructorAccount;

    private Category category;
    private Course publishedCourse;
    private ConversationDetailResponse conversationDetail;

    private Role findOrCreateRole(String name, String description) {
        return entityManager.createQuery("SELECT r FROM Role r WHERE r.name = :name", Role.class)
                .setParameter("name", name)
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    Role role = Role.builder().name(name).description(description).status(1).build();
                    entityManager.persist(role);
                    return role;
                });
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();

        SecurityContextHolder.clearContext();

        studentRole = findOrCreateRole("STUDENT", "Student");
        instructorRole = findOrCreateRole("INSTRUCTOR", "Instructor");

        studentAccount = Account.builder()
                .role(studentRole)
                .email("student_ctrl_" + UUID.randomUUID() + "@test.com")
                .fullName("Student Controller User")
                .status(1)
                .build();
        entityManager.persist(studentAccount);

        instructorAccount = Account.builder()
                .role(instructorRole)
                .email("instructor_ctrl_" + UUID.randomUUID() + "@test.com")
                .fullName("Instructor Controller User")
                .status(1)
                .build();
        entityManager.persist(instructorAccount);

        category = Category.builder()
                .account(instructorAccount)
                .name("Computer Science " + UUID.randomUUID())
                .slug("cs-ctrl-" + UUID.randomUUID())
                .status(1)
                .build();
        entityManager.persist(category);

        publishedCourse = Course.builder()
                .account(instructorAccount)
                .category(category)
                .title("Controller Integration Course")
                .slug("ctrl-integration-" + UUID.randomUUID())
                .price(BigDecimal.valueOf(300))
                .versionNumber(1)
                .status(1)
                .build();
        entityManager.persist(publishedCourse);

        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(15)
                .status(1)
                .build());

        entityManager.flush();

        authenticate(studentAccount);
        conversationDetail = conversationService.createOrGetForStudent(publishedCourse.getId());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(Account account) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                account.getEmail(), null, List.of(() -> "ROLE_" + account.getRole().getName()));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("POST /api/conversations - Student creates/gets conversation successfully")
    void testApiCreateConversationStudent() throws Exception {
        authenticate(studentAccount);

        CreateConversationRequest req = CreateConversationRequest.builder()
                .courseId(publishedCourse.getId())
                .build();

        mockMvc.perform(post("/api/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.id").value(conversationDetail.getId().toString()))
                .andExpect(jsonPath("$.data.course.courseId").value(publishedCourse.getId().toString()));
    }

    @Test
    @DisplayName("GET /api/conversations - List active conversations for authenticated user")
    void testApiGetMyConversations() throws Exception {
        authenticate(studentAccount);

        mockMvc.perform(get("/api/conversations?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].id").value(conversationDetail.getId().toString()));
    }

    @Test
    @DisplayName("GET /api/conversations/{id} - Get conversation detail")
    void testApiGetConversationDetail() throws Exception {
        authenticate(studentAccount);

        mockMvc.perform(get("/api/conversations/{id}", conversationDetail.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.id").value(conversationDetail.getId().toString()));
    }

    @Test
    @DisplayName("POST /api/conversations/{id}/messages - Send message via REST API")
    void testApiSendMessageSuccess() throws Exception {
        authenticate(studentAccount);

        SendMessageRequest req = SendMessageRequest.builder()
                .clientMessageId(UUID.randomUUID())
                .content("Hello via REST Controller")
                .build();

        mockMvc.perform(post("/api/conversations/{id}/messages", conversationDetail.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.content").value("Hello via REST Controller"))
                .andExpect(jsonPath("$.data.mine").value(true));
    }

    @Test
    @DisplayName("GET /api/conversations/{id}/messages - Fetch message history with cursor")
    void testApiGetMessagesHistory() throws Exception {
        authenticate(studentAccount);

        messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Msg REST 1").build());

        mockMvc.perform(get("/api/conversations/{id}/messages?limit=10", conversationDetail.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.items[0].content").value("Msg REST 1"));
    }

    @Test
    @DisplayName("PATCH /api/conversations/{id}/read - Mark conversation read")
    void testApiMarkAsRead() throws Exception {
        authenticate(studentAccount);

        MessageResponse msg = messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Msg to read").build());

        authenticate(instructorAccount);

        MarkConversationReadRequest req = MarkConversationReadRequest.builder()
                .messageId(msg.getId())
                .build();

        mockMvc.perform(patch("/api/conversations/{id}/read", conversationDetail.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.lastReadMessageId").value(msg.getId().toString()))
                .andExpect(jsonPath("$.data.unreadCount").value(0));
    }

    @Test
    @DisplayName("Unauthenticated request returns 401 Unauthorized")
    void testUnauthenticatedApiReturns401() throws Exception {
        SecurityContextHolder.clearContext();

        mockMvc.perform(get("/api/conversations"))
                .andExpect(status().isUnauthorized());
    }
}
