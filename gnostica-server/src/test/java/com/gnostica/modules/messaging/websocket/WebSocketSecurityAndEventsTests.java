package com.gnostica.modules.messaging.websocket;

import com.gnostica.core.model.*;
import com.gnostica.core.model.enums.MessageType;
import com.gnostica.core.security.JwtProvider;
import com.gnostica.core.security.StompChannelInterceptor;
import com.gnostica.modules.messaging.dto.response.ConversationDetailResponse;
import com.gnostica.modules.messaging.event.MessagingEventListener;
import com.gnostica.modules.messaging.event.domain.ConversationReadDomainEvent;
import com.gnostica.modules.messaging.event.domain.MessageCreatedDomainEvent;
import com.gnostica.modules.messaging.repository.ConversationParticipantRepository;
import com.gnostica.modules.messaging.repository.MessageRepository;
import com.gnostica.modules.messaging.service.MessagingConversationService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
@Testcontainers
@Transactional
class WebSocketSecurityAndEventsTests {

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
    private JwtProvider jwtProvider;

    @Autowired
    private StompChannelInterceptor stompChannelInterceptor;

    @Autowired
    private MessagingConversationService conversationService;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    private SimpMessagingTemplate messagingTemplate;
    private MessageChannel messageChannel;
    private MessagingEventListener messagingEventListener;

    private Role studentRole;
    private Role instructorRole;
    private Role adminRole;

    private Account studentAccount;
    private Account instructorAccount;
    private Account adminAccount;

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
        SecurityContextHolder.clearContext();

        messagingTemplate = mock(SimpMessagingTemplate.class);
        messageChannel = mock(MessageChannel.class);
        messagingEventListener = new MessagingEventListener(messagingTemplate, messageRepository, participantRepository);

        studentRole = findOrCreateRole("STUDENT", "Student");
        instructorRole = findOrCreateRole("INSTRUCTOR", "Instructor");
        adminRole = findOrCreateRole("ADMIN", "Admin");

        studentAccount = Account.builder()
                .role(studentRole)
                .email("student_ws_" + UUID.randomUUID() + "@test.com")
                .fullName("Student WS User")
                .status(1)
                .build();
        entityManager.persist(studentAccount);

        instructorAccount = Account.builder()
                .role(instructorRole)
                .email("instructor_ws_" + UUID.randomUUID() + "@test.com")
                .fullName("Instructor WS User")
                .status(1)
                .build();
        entityManager.persist(instructorAccount);

        adminAccount = Account.builder()
                .role(adminRole)
                .email("admin_ws_" + UUID.randomUUID() + "@test.com")
                .fullName("Admin WS User")
                .status(1)
                .build();
        entityManager.persist(adminAccount);

        category = Category.builder()
                .account(instructorAccount)
                .name("Computer Science " + UUID.randomUUID())
                .slug("cs-ws-" + UUID.randomUUID())
                .status(1)
                .build();
        entityManager.persist(category);

        publishedCourse = Course.builder()
                .account(instructorAccount)
                .category(category)
                .title("WebSocket Integration Course")
                .slug("ws-integration-" + UUID.randomUUID())
                .price(BigDecimal.valueOf(400))
                .versionNumber(1)
                .status(1)
                .build();
        entityManager.persist(publishedCourse);

        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(20)
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
                account.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_" + account.getRole().getName())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ==========================================
    // 1. STOMP CONNECT Authentication Tests
    // ==========================================

    @Test
    @DisplayName("STOMP CONNECT with valid JWT token authenticates user session")
    void testStompConnectSuccess() {
        authenticate(studentAccount);
        String token = jwtProvider.generateToken(SecurityContextHolder.getContext().getAuthentication());

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer " + token);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        stompChannelInterceptor.preSend(message, messageChannel);

        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(message);
        assertThat(resultAccessor.getUser()).isNotNull();
        assertThat(resultAccessor.getUser().getName()).isEqualTo(studentAccount.getEmail());
    }

    @Test
    @DisplayName("STOMP CONNECT with missing/invalid JWT token throws BadCredentialsException")
    void testStompConnectMissingToken() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompChannelInterceptor.preSend(message, messageChannel))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ==========================================
    // 2. SUBSCRIBE Authorization Tests
    // ==========================================

    @Test
    @DisplayName("Authenticated user can subscribe to /user/queue/messages")
    void testStompSubscribeUserQueueSuccess() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/user/queue/messages");
        accessor.setUser(new UsernamePasswordAuthenticationToken(studentAccount.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))));
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = stompChannelInterceptor.preSend(message, messageChannel);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Non-admin user subscribing to /topic/metrics throws AccessDeniedException")
    void testStompSubscribeMetricsForbiddenForNonAdmin() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/metrics");
        accessor.setUser(new UsernamePasswordAuthenticationToken(studentAccount.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))));
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompChannelInterceptor.preSend(message, messageChannel))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Admin user subscribing to /topic/metrics succeeds")
    void testStompSubscribeMetricsSuccessForAdmin() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/metrics");
        accessor.setUser(new UsernamePasswordAuthenticationToken(adminAccount.getEmail(), null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))));
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = stompChannelInterceptor.preSend(message, messageChannel);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Client STOMP SEND to messaging destination throws AccessDeniedException")
    void testStompSendForbidden() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setDestination("/app/messages");
        Message<byte[]> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        assertThatThrownBy(() -> stompChannelInterceptor.preSend(message, messageChannel))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ==========================================
    // 3. Realtime Domain Event Tests
    // ==========================================

    @Test
    @DisplayName("MessageCreatedDomainEvent AFTER_COMMIT sends STOMP event to both student and instructor")
    void testMessageCreatedDomainEventEmitsRealtimeEvent() {
        MessageCreatedDomainEvent event = MessageCreatedDomainEvent.builder()
                .conversationId(conversationDetail.getId())
                .messageId(UUID.randomUUID())
                .senderId(studentAccount.getId())
                .senderName(studentAccount.getFullName())
                .senderAvatar(studentAccount.getAvatar())
                .clientMessageId(UUID.randomUUID())
                .type(MessageType.TEXT)
                .content("Realtime test message")
                .createdAt(LocalDateTime.now())
                .studentAccountId(studentAccount.getId())
                .studentEmail(studentAccount.getEmail())
                .instructorAccountId(instructorAccount.getId())
                .instructorEmail(instructorAccount.getEmail())
                .createdNew(true)
                .build();

        messagingEventListener.handleMessageCreated(event);

        // Verify STOMP messages delivered to student and instructor on user queues
        verify(messagingTemplate).convertAndSendToUser(eq(studentAccount.getEmail()), eq("/queue/messages"), any());
        verify(messagingTemplate).convertAndSendToUser(eq(instructorAccount.getEmail()), eq("/queue/messages"), any());
        verify(messagingTemplate).convertAndSendToUser(eq(studentAccount.getEmail()), eq("/queue/conversations"), any());
        verify(messagingTemplate).convertAndSendToUser(eq(instructorAccount.getEmail()), eq("/queue/conversations"), any());
    }

    @Test
    @DisplayName("Idempotent retry (createdNew = false) does NOT emit duplicate STOMP events")
    void testIdempotentRetryDoesNotEmitEvent() {
        MessageCreatedDomainEvent event = MessageCreatedDomainEvent.builder()
                .conversationId(conversationDetail.getId())
                .messageId(UUID.randomUUID())
                .senderId(studentAccount.getId())
                .studentEmail(studentAccount.getEmail())
                .instructorEmail(instructorAccount.getEmail())
                .createdNew(false)
                .build();

        messagingEventListener.handleMessageCreated(event);

        verifyNoInteractions(messagingTemplate);
    }

    @Test
    @DisplayName("ConversationReadDomainEvent AFTER_COMMIT sends STOMP read receipt to both participants")
    void testConversationReadDomainEventEmitsReadReceipt() {
        ConversationReadDomainEvent event = ConversationReadDomainEvent.builder()
                .conversationId(conversationDetail.getId())
                .readerAccountId(instructorAccount.getId())
                .readerEmail(instructorAccount.getEmail())
                .otherAccountId(studentAccount.getId())
                .otherEmail(studentAccount.getEmail())
                .lastReadMessageId(UUID.randomUUID())
                .lastReadAt(LocalDateTime.now())
                .build();

        messagingEventListener.handleConversationRead(event);

        verify(messagingTemplate).convertAndSendToUser(eq(instructorAccount.getEmail()), eq("/queue/read-receipts"), any());
        verify(messagingTemplate).convertAndSendToUser(eq(studentAccount.getEmail()), eq("/queue/read-receipts"), any());
    }
}
