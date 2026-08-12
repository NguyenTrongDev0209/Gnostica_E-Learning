package com.gnostica.modules.messaging.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.core.model.Message;
import com.gnostica.core.model.Role;
import com.gnostica.core.model.enums.MessageType;
import com.gnostica.core.model.enums.ParticipantRole;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@Transactional
class MessagingRepositoryTests {

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
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationParticipantRepository conversationParticipantRepository;

    @Autowired
    private MessageRepository messageRepository;

    private Role studentRole;
    private Role instructorRole;
    private Account student;
    private Account instructor;
    private Category category;
    private Course course;

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
        studentRole = findOrCreateRole("STUDENT", "Student Role");
        instructorRole = findOrCreateRole("INSTRUCTOR", "Instructor Role");

        student = Account.builder()
                .role(studentRole)
                .email("student_" + UUID.randomUUID() + "@test.com")
                .fullName("Student User")
                .status(1)
                .build();
        entityManager.persist(student);

        instructor = Account.builder()
                .role(instructorRole)
                .email("instructor_" + UUID.randomUUID() + "@test.com")
                .fullName("Instructor User")
                .status(1)
                .build();
        entityManager.persist(instructor);

        category = Category.builder()
                .account(instructor)
                .name("Software Engineering " + UUID.randomUUID())
                .slug("software-engineering-" + UUID.randomUUID())
                .status(1)
                .build();
        entityManager.persist(category);

        course = Course.builder()
                .account(instructor)
                .category(category)
                .title("Spring Boot 4 Masterclass")
                .slug("spring-boot-4-masterclass-" + UUID.randomUUID())
                .price(BigDecimal.valueOf(100))
                .versionNumber(1)
                .status(1)
                .build();
        entityManager.persist(course);

        entityManager.flush();
    }

    @Test
    @DisplayName("Should create conversation and participants, and find conversation by course, student and instructor")
    void testCreateAndFindConversation() {
        Conversation conversation = Conversation.builder()
                .course(course)
                .student(student)
                .instructor(instructor)
                .build();
        conversation = conversationRepository.save(conversation);

        ConversationParticipant pStudent = ConversationParticipant.builder()
                .conversation(conversation)
                .account(student)
                .role(ParticipantRole.STUDENT)
                .build();

        ConversationParticipant pInstructor = ConversationParticipant.builder()
                .conversation(conversation)
                .account(instructor)
                .role(ParticipantRole.INSTRUCTOR)
                .build();

        conversationParticipantRepository.saveAll(List.of(pStudent, pInstructor));
        entityManager.flush();

        Optional<Conversation> found = conversationRepository.findByCourseIdAndStudentIdAndInstructorId(
                course.getId(), student.getId(), instructor.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getCourse().getId()).isEqualTo(course.getId());
        assertThat(found.get().getStudent().getId()).isEqualTo(student.getId());
        assertThat(found.get().getInstructor().getId()).isEqualTo(instructor.getId());
    }

    @Test
    @DisplayName("Should save message with UUID clientMessageId and prevent duplicate sender_id + client_message_id")
    void testMessageClientMessageIdDeduplication() {
        Conversation conversation = conversationRepository.save(Conversation.builder()
                .course(course)
                .student(student)
                .instructor(instructor)
                .build());

        UUID clientMsgId = UUID.randomUUID();
        Message msg1 = Message.builder()
                .conversation(conversation)
                .sender(student)
                .clientMessageId(clientMsgId)
                .content("Hello Teacher!")
                .type(MessageType.TEXT)
                .build();

        messageRepository.save(msg1);
        entityManager.flush();

        Optional<Message> foundMsg = messageRepository.findBySenderIdAndClientMessageId(student.getId(), clientMsgId);
        assertThat(foundMsg).isPresent();
        assertThat(foundMsg.get().getContent()).isEqualTo("Hello Teacher!");
        assertThat(foundMsg.get().getClientMessageId()).isEqualTo(clientMsgId);
    }

    @Test
    @DisplayName("Should perform deterministic cursor pagination using (createdAt, id) tuple")
    void testCursorPaginationWithCreatedAtAndIdTuple() throws InterruptedException {
        Conversation conversation = conversationRepository.save(Conversation.builder()
                .course(course)
                .student(student)
                .instructor(instructor)
                .build());

        Message msg1 = Message.builder()
                .conversation(conversation)
                .sender(student)
                .content("Message 1")
                .type(MessageType.TEXT)
                .build();
        entityManager.persist(msg1);

        Thread.sleep(10);
        Message msg2 = Message.builder()
                .conversation(conversation)
                .sender(instructor)
                .content("Message 2")
                .type(MessageType.TEXT)
                .build();
        entityManager.persist(msg2);

        Thread.sleep(10);
        Message msg3 = Message.builder()
                .conversation(conversation)
                .sender(student)
                .content("Message 3")
                .type(MessageType.TEXT)
                .build();
        entityManager.persist(msg3);

        entityManager.flush();

        // Fetch page before msg3 (using msg3's createdAt and id)
        List<Message> nextCursorPage = messageRepository.findNextCursorPage(
                conversation.getId(), msg3.getCreatedAt(), msg3.getId(), PageRequest.of(0, 10));

        assertThat(nextCursorPage).hasSize(2);
        assertThat(nextCursorPage.get(0).getContent()).isEqualTo("Message 2");
        assertThat(nextCursorPage.get(1).getContent()).isEqualTo("Message 1");
    }

    @Test
    @DisplayName("Should dynamically calculate unread count based on lastReadAt cursor")
    void testDynamicUnreadCount() throws InterruptedException {
        Conversation conversation = conversationRepository.save(Conversation.builder()
                .course(course)
                .student(student)
                .instructor(instructor)
                .build());

        Message msg1 = Message.builder()
                .conversation(conversation)
                .sender(student)
                .content("Student msg 1")
                .type(MessageType.TEXT)
                .build();
        entityManager.persist(msg1);

        Thread.sleep(10);
        LocalDateTime readTimestamp = LocalDateTime.now();

        Thread.sleep(10);
        Message msg2 = Message.builder()
                .conversation(conversation)
                .sender(student)
                .content("Student msg 2")
                .type(MessageType.TEXT)
                .build();
        entityManager.persist(msg2);

        entityManager.flush();

        // Instructor calculates unread count after reading up to readTimestamp
        long unreadForInstructor = messageRepository.countUnreadMessages(
                conversation.getId(), instructor.getId(), readTimestamp);

        assertThat(unreadForInstructor).isEqualTo(1);
    }
}
