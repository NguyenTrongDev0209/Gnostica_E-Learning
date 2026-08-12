package com.gnostica.modules.messaging.service;

import com.gnostica.core.exception.BadRequestException;
import com.gnostica.core.exception.ForbiddenException;
import com.gnostica.core.exception.IdempotencyConflictException;
import com.gnostica.core.exception.ResourceNotFoundException;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.model.Role;
import com.gnostica.core.model.enums.MessageType;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.modules.messaging.dto.request.SendMessageRequest;
import com.gnostica.modules.messaging.dto.response.ConversationDetailResponse;
import com.gnostica.modules.messaging.dto.response.ConversationReadResponse;
import com.gnostica.modules.messaging.dto.response.CursorPageResponse;
import com.gnostica.modules.messaging.dto.response.MessageResponse;
import com.gnostica.modules.messaging.repository.ConversationRepository;
import com.gnostica.modules.messaging.repository.MessageRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Testcontainers
@Transactional
class MessagingMessageServiceTests {

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
    private EntityManager entityManager;

    @Autowired
    private MessagingConversationService conversationService;

    @Autowired
    private MessagingMessageService messageService;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    private Role studentRole;
    private Role instructorRole;
    private Account studentAccount;
    private Account instructorAccount;
    private Account thirdPartyAccount;

    private Category category;
    private Course publishedCourse;
    private ConversationDetailResponse conversationDetail;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        studentRole = Role.builder().name("STUDENT").description("Student").status(1).build();
        entityManager.persist(studentRole);

        instructorRole = Role.builder().name("INSTRUCTOR").description("Instructor").status(1).build();
        entityManager.persist(instructorRole);

        studentAccount = Account.builder()
                .role(studentRole)
                .email("student_msg_" + UUID.randomUUID() + "@test.com")
                .fullName("Student Msg User")
                .status(1)
                .build();
        entityManager.persist(studentAccount);

        instructorAccount = Account.builder()
                .role(instructorRole)
                .email("instructor_msg_" + UUID.randomUUID() + "@test.com")
                .fullName("Instructor Msg User")
                .status(1)
                .build();
        entityManager.persist(instructorAccount);

        thirdPartyAccount = Account.builder()
                .role(studentRole)
                .email("thirdparty_msg_" + UUID.randomUUID() + "@test.com")
                .fullName("Third Party Msg User")
                .status(1)
                .build();
        entityManager.persist(thirdPartyAccount);

        category = Category.builder()
                .name("Computer Science " + UUID.randomUUID())
                .slug("cs-msg-" + UUID.randomUUID())
                .status(1)
                .build();
        entityManager.persist(category);

        publishedCourse = Course.builder()
                .account(instructorAccount)
                .category(category)
                .title("Advanced Messaging Course")
                .slug("advanced-messaging-" + UUID.randomUUID())
                .price(BigDecimal.valueOf(250))
                .versionNumber(1)
                .status(1)
                .build();
        entityManager.persist(publishedCourse);

        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(10)
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

    // ==========================================
    // A. Send Message Tests
    // ==========================================

    @Test
    @DisplayName("A1 & A2. Student and Instructor can send TEXT message successfully")
    void testSendTextMessageSuccess() {
        authenticate(studentAccount);
        UUID clientMsgId1 = UUID.randomUUID();

        MessageResponse res1 = messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(clientMsgId1).content("  Hello Teacher!  ").build()
        );

        assertThat(res1).isNotNull();
        assertThat(res1.getContent()).isEqualTo("Hello Teacher!"); // Trimmed
        assertThat(res1.isMine()).isTrue();
        assertThat(res1.getSenderId()).isEqualTo(studentAccount.getId());

        // Check Conversation lastMessage updated
        Conversation updatedConv = conversationRepository.findById(conversationDetail.getId()).orElseThrow();
        assertThat(updatedConv.getLastMessage()).isNotNull();
        assertThat(updatedConv.getLastMessage().getId()).isEqualTo(res1.getId());
        assertThat(updatedConv.getLastMessageText()).isEqualTo("Hello Teacher!");

        // Instructor replies
        authenticate(instructorAccount);
        UUID clientMsgId2 = UUID.randomUUID();

        MessageResponse res2 = messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(clientMsgId2).content("Hello Student! How can I help?").build()
        );

        assertThat(res2).isNotNull();
        assertThat(res2.isMine()).isTrue();
        assertThat(res2.getSenderId()).isEqualTo(instructorAccount.getId());
    }

    @Test
    @DisplayName("A3. Non-participant sending message is forbidden")
    void testNonParticipantSendMessageForbidden() {
        authenticate(thirdPartyAccount);

        assertThatThrownBy(() -> messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Spam").build()
        )).isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("A5-A8. Content validation: null, blank, whitespace-only, over limit")
    void testMessageContentValidation() {
        authenticate(studentAccount);

        // Null content
        assertThatThrownBy(() -> messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content(null).build()
        )).isInstanceOf(BadRequestException.class);

        // Blank / Whitespace content
        assertThatThrownBy(() -> messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("   ").build()
        )).isInstanceOf(BadRequestException.class);

        // Content exceeding 5000 chars
        String longContent = "A".repeat(5001);
        assertThatThrownBy(() -> messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content(longContent).build()
        )).isInstanceOf(BadRequestException.class);
    }

    // ==========================================
    // B. Idempotency & Conflict Tests
    // ==========================================

    @Test
    @DisplayName("B13-B14. Retrying send with same clientMessageId and payload returns identical message")
    void testSendIdempotency() {
        authenticate(studentAccount);
        UUID clientMsgId = UUID.randomUUID();

        SendMessageRequest req = SendMessageRequest.builder().clientMessageId(clientMsgId).content("Same content").build();

        MessageResponse res1 = messageService.sendTextMessage(conversationDetail.getId(), req);
        MessageResponse res2 = messageService.sendTextMessage(conversationDetail.getId(), req);

        assertThat(res1.getId()).isEqualTo(res2.getId());

        long msgCount = messageRepository.count();
        assertThat(msgCount).isEqualTo(1);
    }

    @Test
    @DisplayName("B15. Same clientMessageId with different content throws IdempotencyConflictException (HTTP 409)")
    void testSendConflictDifferentContent() {
        authenticate(studentAccount);
        UUID clientMsgId = UUID.randomUUID();

        messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(clientMsgId).content("Content 1").build());

        assertThatThrownBy(() -> messageService.sendTextMessage(
                conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(clientMsgId).content("Content 2").build()
        )).isInstanceOf(IdempotencyConflictException.class);
    }

    // ==========================================
    // D. Cursor History Pagination Tests
    // ==========================================

    @Test
    @DisplayName("D22-D29. Fetch message history with opaque cursor pagination and ASC UI reordering")
    void testGetMessagesCursorPagination() throws InterruptedException {
        authenticate(studentAccount);

        // Send 3 messages
        MessageResponse m1 = messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Message 1").build());

        Thread.sleep(10);
        authenticate(instructorAccount);
        MessageResponse m2 = messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Message 2").build());

        Thread.sleep(10);
        authenticate(studentAccount);
        MessageResponse m3 = messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Message 3").build());

        // Fetch page 1 with limit = 2
        CursorPageResponse<MessageResponse> page1 = messageService.getMessages(conversationDetail.getId(), null, 2);

        assertThat(page1.isHasNext()).isTrue();
        assertThat(page1.getItems()).hasSize(2);
        // Page items are reversed to chronological ASC order (m2 then m3)
        assertThat(page1.getItems().get(0).getContent()).isEqualTo("Message 2");
        assertThat(page1.getItems().get(1).getContent()).isEqualTo("Message 3");
        assertThat(page1.getNextCursor()).isNotNull();

        // Fetch page 2 using cursor
        CursorPageResponse<MessageResponse> page2 = messageService.getMessages(conversationDetail.getId(), page1.getNextCursor(), 2);

        assertThat(page2.isHasNext()).isFalse();
        assertThat(page2.getItems()).hasSize(1);
        assertThat(page2.getItems().get(0).getContent()).isEqualTo("Message 1");
    }

    // ==========================================
    // E. Read State Tests
    // ==========================================

    @Test
    @DisplayName("E32-E38. Mark as read updates read cursor and recalculates unread count")
    void testMarkAsReadAndUnreadCount() throws InterruptedException {
        // Student sends 2 messages
        authenticate(studentAccount);
        MessageResponse m1 = messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Msg 1").build());

        Thread.sleep(10);
        MessageResponse m2 = messageService.sendTextMessage(conversationDetail.getId(),
                SendMessageRequest.builder().clientMessageId(UUID.randomUUID()).content("Msg 2").build());

        // Instructor reads m1
        authenticate(instructorAccount);

        ConversationReadResponse readRes1 = messageService.markAsRead(conversationDetail.getId(), m1.getId());

        assertThat(readRes1.getLastReadMessageId()).isEqualTo(m1.getId());
        assertThat(readRes1.getUnreadCount()).isEqualTo(1); // m2 still unread

        // Instructor reads m2
        ConversationReadResponse readRes2 = messageService.markAsRead(conversationDetail.getId(), m2.getId());

        assertThat(readRes2.getLastReadMessageId()).isEqualTo(m2.getId());
        assertThat(readRes2.getUnreadCount()).isEqualTo(0);
    }
}
