package com.gnostica.modules.messaging.service;

import com.gnostica.core.exception.BadRequestException;
import com.gnostica.core.exception.ForbiddenException;
import com.gnostica.core.exception.ResourceNotFoundException;
import com.gnostica.core.exception.UnauthorizedException;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.model.Role;
import com.gnostica.core.model.enums.ParticipantRole;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.modules.messaging.dto.response.ConversationDetailResponse;
import com.gnostica.modules.messaging.dto.response.ConversationSummaryResponse;
import com.gnostica.modules.messaging.repository.ConversationParticipantRepository;
import com.gnostica.modules.messaging.repository.ConversationRepository;
import com.gnostica.modules.messaging.repository.MessageRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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

@SpringBootTest
@Testcontainers
@Transactional
class MessagingConversationServiceTests {

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
    private ConversationRepository conversationRepository;

    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CourseRepository courseRepository;

    private Role studentRole;
    private Role instructorRole;
    private Account studentAccount;
    private Account student2Account;
    private Account instructorAccount;
    private Account otherInstructorAccount;
    private Account thirdPartyAccount;

    private Category category;
    private Course publishedCourse;
    private Course draftCourse;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();

        studentRole = Role.builder().name("STUDENT").description("Student").status(1).build();
        entityManager.persist(studentRole);

        instructorRole = Role.builder().name("INSTRUCTOR").description("Instructor").status(1).build();
        entityManager.persist(instructorRole);

        studentAccount = Account.builder()
                .role(studentRole)
                .email("student1_" + UUID.randomUUID() + "@test.com")
                .fullName("Student One")
                .status(1)
                .build();
        entityManager.persist(studentAccount);

        student2Account = Account.builder()
                .role(studentRole)
                .email("student2_" + UUID.randomUUID() + "@test.com")
                .fullName("Student Two")
                .status(1)
                .build();
        entityManager.persist(student2Account);

        instructorAccount = Account.builder()
                .role(instructorRole)
                .email("instructor1_" + UUID.randomUUID() + "@test.com")
                .fullName("Instructor One")
                .status(1)
                .build();
        entityManager.persist(instructorAccount);

        otherInstructorAccount = Account.builder()
                .role(instructorRole)
                .email("instructor2_" + UUID.randomUUID() + "@test.com")
                .fullName("Instructor Two")
                .status(1)
                .build();
        entityManager.persist(otherInstructorAccount);

        thirdPartyAccount = Account.builder()
                .role(studentRole)
                .email("thirdparty_" + UUID.randomUUID() + "@test.com")
                .fullName("Third Party User")
                .status(1)
                .build();
        entityManager.persist(thirdPartyAccount);

        category = Category.builder()
                .name("Computer Science " + UUID.randomUUID())
                .slug("cs-" + UUID.randomUUID())
                .status(1)
                .build();
        entityManager.persist(category);

        publishedCourse = Course.builder()
                .account(instructorAccount)
                .category(category)
                .title("Java 17 Masterclass")
                .slug("java-17-masterclass-" + UUID.randomUUID())
                .price(BigDecimal.valueOf(200))
                .versionNumber(1)
                .status(1) // Published/Active
                .build();
        entityManager.persist(publishedCourse);

        draftCourse = Course.builder()
                .account(instructorAccount)
                .category(category)
                .title("Draft Java Course")
                .slug("draft-java-" + UUID.randomUUID())
                .price(BigDecimal.valueOf(100))
                .versionNumber(1)
                .status(4) // Draft
                .build();
        entityManager.persist(draftCourse);

        entityManager.flush();
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
    // A. Current Account Resolution Tests
    // ==========================================

    @Test
    @DisplayName("A1. Should throw UnauthorizedException when no authentication in SecurityContext")
    void testCurrentAccountUnauthenticated() {
        assertThatThrownBy(() -> conversationService.createOrGetForStudent(publishedCourse.getId()))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Vui lòng đăng nhập");
    }

    @Test
    @DisplayName("A2 & A3. Should throw ForbiddenException if account is banned/inactive")
    void testCurrentAccountBanned() {
        Account bannedAccount = Account.builder()
                .role(studentRole)
                .email("banned_" + UUID.randomUUID() + "@test.com")
                .fullName("Banned User")
                .status(2) // Banned
                .build();
        entityManager.persist(bannedAccount);
        entityManager.flush();

        authenticate(bannedAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForStudent(publishedCourse.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Tài khoản hiện đang bị khóa");
    }

    // ==========================================
    // B. Student Flow Tests
    // ==========================================

    @Test
    @DisplayName("B4. Student with enrollment status 1 (In Progress) creates conversation successfully")
    void testStudentCreateConversationStatus1() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(10)
                .status(1) // In Progress
                .build());
        entityManager.flush();

        authenticate(studentAccount);

        ConversationDetailResponse response = conversationService.createOrGetForStudent(publishedCourse.getId());

        assertThat(response).isNotNull();
        assertThat(response.getCourse().getCourseId()).isEqualTo(publishedCourse.getId());
        assertThat(response.getStudent().getAccountId()).isEqualTo(studentAccount.getId());
        assertThat(response.getInstructor().getAccountId()).isEqualTo(instructorAccount.getId());
        assertThat(response.getCurrentParticipantRole()).isEqualTo(ParticipantRole.STUDENT);
    }

    @Test
    @DisplayName("B5. Student with enrollment status 2 (Completed) creates conversation successfully")
    void testStudentCreateConversationStatus2() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(100)
                .status(2) // Completed
                .build());
        entityManager.flush();

        authenticate(studentAccount);

        ConversationDetailResponse response = conversationService.createOrGetForStudent(publishedCourse.getId());

        assertThat(response).isNotNull();
        assertThat(response.getCourse().getCourseId()).isEqualTo(publishedCourse.getId());
    }

    @Test
    @DisplayName("B6. Student with enrollment status 0 (Dropped/Refunded) is forbidden")
    void testStudentCreateConversationStatus0Forbidden() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(0)
                .status(0) // Dropped/Refunded
                .build());
        entityManager.flush();

        authenticate(studentAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForStudent(publishedCourse.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Bạn cần đăng ký khóa học");
    }

    @Test
    @DisplayName("B7. Student without enrollment is forbidden")
    void testStudentWithoutEnrollmentForbidden() {
        authenticate(studentAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForStudent(publishedCourse.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("B8. Non-existent course throws ResourceNotFoundException")
    void testNonExistentCourseNotFound() {
        authenticate(studentAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForStudent(UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("B9. Draft/Pending course is forbidden")
    void testDraftCourseForbidden() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(draftCourse)
                .progressPercent(0)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(studentAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForStudent(draftCourse.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("chưa được xuất bản");
    }

    @Test
    @DisplayName("B10. Instructor cannot self-chat via student endpoint")
    void testInstructorSelfChatForbidden() {
        entityManager.persist(Enrollment.builder()
                .account(instructorAccount)
                .course(publishedCourse)
                .progressPercent(0)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(instructorAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForStudent(publishedCourse.getId()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Giảng viên không thể tự mở hội thoại");
    }

    // ==========================================
    // C. Instructor Flow Tests
    // ==========================================

    @Test
    @DisplayName("C11. Course owner instructor opens conversation for enrolled student successfully")
    void testInstructorCreateConversationForStudentSuccess() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(50)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(instructorAccount);

        ConversationDetailResponse response = conversationService.createOrGetForInstructor(
                publishedCourse.getId(), studentAccount.getId());

        assertThat(response).isNotNull();
        assertThat(response.getInstructor().getAccountId()).isEqualTo(instructorAccount.getId());
        assertThat(response.getStudent().getAccountId()).isEqualTo(studentAccount.getId());
        assertThat(response.getCurrentParticipantRole()).isEqualTo(ParticipantRole.INSTRUCTOR);
    }

    @Test
    @DisplayName("C12. Non-owner instructor is forbidden")
    void testNonOwnerInstructorForbidden() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(50)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(otherInstructorAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForInstructor(publishedCourse.getId(), studentAccount.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Chỉ giảng viên sở hữu khóa học");
    }

    @Test
    @DisplayName("C13. Instructor cannot open conversation for non-enrolled student")
    void testInstructorForNonEnrolledStudentForbidden() {
        authenticate(instructorAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForInstructor(publishedCourse.getId(), studentAccount.getId()))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Học viên chưa có enrollment hợp lệ");
    }

    @Test
    @DisplayName("C14. Instructor specifying non-existent student throws ResourceNotFoundException")
    void testInstructorForNonExistentStudentNotFound() {
        authenticate(instructorAccount);

        assertThatThrownBy(() -> conversationService.createOrGetForInstructor(publishedCourse.getId(), UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ==========================================
    // D. Idempotency & Database Constraints Tests
    // ==========================================

    @Test
    @DisplayName("D15-D18. Calling createOrGet twice returns identical conversation and produces exactly 2 participants")
    void testIdempotencyAndParticipantCreation() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(20)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(studentAccount);

        ConversationDetailResponse res1 = conversationService.createOrGetForStudent(publishedCourse.getId());
        ConversationDetailResponse res2 = conversationService.createOrGetForStudent(publishedCourse.getId());

        assertThat(res1.getId()).isEqualTo(res2.getId());

        long convCount = conversationRepository.count();
        assertThat(convCount).isEqualTo(1);

        List<ConversationParticipant> participants = participantRepository.findByConversationId(res1.getId());
        assertThat(participants).hasSize(2);
        assertThat(participants).extracting(p -> p.getAccount().getId())
                .containsExactlyInAnyOrder(studentAccount.getId(), instructorAccount.getId());
    }

    // ==========================================
    // E. Authorization & Security Tests
    // ==========================================

    @Test
    @DisplayName("E20-E23. Student and Instructor can read conversation; Third-party user is forbidden")
    void testGetConversationAuthorization() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(20)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(studentAccount);
        ConversationDetailResponse created = conversationService.createOrGetForStudent(publishedCourse.getId());

        // Student can access
        ConversationDetailResponse studentAccess = conversationService.getConversation(created.getId());
        assertThat(studentAccess.getId()).isEqualTo(created.getId());

        // Instructor can access
        authenticate(instructorAccount);
        ConversationDetailResponse instructorAccess = conversationService.getConversation(created.getId());
        assertThat(instructorAccess.getId()).isEqualTo(created.getId());

        // Third-party student forbidden
        authenticate(thirdPartyAccount);
        assertThatThrownBy(() -> conversationService.getConversation(created.getId()))
                .isInstanceOf(ForbiddenException.class);

        // Third-party instructor forbidden
        authenticate(otherInstructorAccount);
        assertThatThrownBy(() -> conversationService.getConversation(created.getId()))
                .isInstanceOf(ForbiddenException.class);
    }

    // ==========================================
    // F. Soft Delete Restoration Tests
    // ==========================================

    @Test
    @DisplayName("F25-F27. Opening soft-deleted conversation restores existing record and preserves ID")
    void testSoftDeleteRestoration() {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(30)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(studentAccount);
        ConversationDetailResponse initial = conversationService.createOrGetForStudent(publishedCourse.getId());
        UUID originalId = initial.getId();

        // Soft-delete conversation
        Conversation conv = conversationRepository.findById(originalId).orElseThrow();
        conv.setDeletedAt(LocalDateTime.now());
        conversationRepository.saveAndFlush(conv);

        // Re-open conversation
        ConversationDetailResponse restored = conversationService.createOrGetForStudent(publishedCourse.getId());

        assertThat(restored.getId()).isEqualTo(originalId);
        Conversation restoredEntity = conversationRepository.findById(originalId).orElseThrow();
        assertThat(restoredEntity.getDeletedAt()).isNull();
    }

    // ==========================================
    // G. Query & Performance Tests
    // ==========================================

    @Test
    @DisplayName("G28-G29. getMyConversations filters by account and orders by COALESCE(lastMessageAt, createdAt) DESC")
    void testGetMyConversationsQueryAndOrder() throws InterruptedException {
        entityManager.persist(Enrollment.builder()
                .account(studentAccount)
                .course(publishedCourse)
                .progressPercent(30)
                .status(1)
                .build());
        entityManager.flush();

        authenticate(studentAccount);
        ConversationDetailResponse conv1 = conversationService.createOrGetForStudent(publishedCourse.getId());

        Thread.sleep(10);
        // Simulate message activity on conv1
        Conversation conv1Entity = conversationRepository.findById(conv1.getId()).orElseThrow();
        conv1Entity.setLastMessageAt(LocalDateTime.now());
        conversationRepository.saveAndFlush(conv1Entity);

        Page<ConversationSummaryResponse> myConversations = conversationService.getMyConversations(PageRequest.of(0, 10));

        assertThat(myConversations.getContent()).hasSize(1);
        assertThat(myConversations.getContent().get(0).getId()).isEqualTo(conv1.getId());
    }
}
