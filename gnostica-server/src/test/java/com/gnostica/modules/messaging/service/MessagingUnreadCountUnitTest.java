package com.gnostica.modules.messaging.service;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Message;
import com.gnostica.core.security.AuthenticatedAccountProvider;
import com.gnostica.modules.messaging.dto.response.ConversationSummaryResponse;
import com.gnostica.modules.messaging.mapper.ConversationMapper;
import com.gnostica.modules.messaging.repository.ConversationParticipantRepository;
import com.gnostica.modules.messaging.repository.ConversationRepository;
import com.gnostica.modules.messaging.repository.MessageRepository;
import com.gnostica.modules.messaging.service.impl.MessagingConversationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessagingUnreadCountUnitTest {

    @Mock
    private AuthenticatedAccountProvider authenticatedAccountProvider;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ConversationParticipantRepository participantRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ConversationMapper conversationMapper;

    @InjectMocks
    private MessagingConversationServiceImpl conversationService;

    private Account instructor;
    private Account student;
    private Conversation conversation;
    private UUID conversationId;
    private UUID instructorId;
    private UUID studentId;

    @BeforeEach
    void setUp() {
        instructorId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        conversationId = UUID.randomUUID();

        instructor = Account.builder().id(instructorId).email("instructor@test.com").fullName("Instructor User").build();
        student = Account.builder().id(studentId).email("student@test.com").fullName("Student User").build();

        Course course = Course.builder().id(UUID.randomUUID()).title("React 19").account(instructor).build();
        conversation = Conversation.builder().id(conversationId).course(course).student(student).instructor(instructor).build();
    }

    @Test
    @DisplayName("A. Participant chưa từng đọc (lastReadAt = null) -> Đếm tất cả unread tin nhắn từ đối phương (unread = 3)")
    void testGetMyConversations_WhenUnreadAndNeverRead_ReturnsCorrectUnreadCount() {
        when(authenticatedAccountProvider.requireCurrentAccount()).thenReturn(instructor);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Conversation> conversationPage = new PageImpl<>(List.of(conversation));
        when(conversationRepository.findActiveConversationsByAccountId(instructorId, pageable)).thenReturn(conversationPage);

        // Participant has never read (lastReadAt = null, lastReadMessage = null)
        ConversationParticipant participant = ConversationParticipant.builder()
                .id(UUID.randomUUID())
                .conversation(conversation)
                .account(instructor)
                .lastReadAt(null)
                .lastReadMessage(null)
                .build();

        when(participantRepository.findByConversationIdAndAccountId(conversationId, instructorId))
                .thenReturn(Optional.of(participant));

        // Mock 3 unread messages from student
        when(messageRepository.countUnreadForParticipant(conversationId, instructorId, null, null))
                .thenReturn(3L);

        ConversationSummaryResponse expectedResponse = ConversationSummaryResponse.builder()
                .id(conversationId)
                .unreadCount(3L)
                .build();

        when(conversationMapper.toSummaryResponse(conversation, instructorId, 3L))
                .thenReturn(expectedResponse);

        Page<ConversationSummaryResponse> result = conversationService.getMyConversations(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUnreadCount()).isEqualTo(3L);

        verify(messageRepository).countUnreadForParticipant(conversationId, instructorId, null, null);
    }

    @Test
    @DisplayName("B. Participant đã đọc 2/3 tin nhắn -> countUnreadForParticipant trả về 1")
    void testGetMyConversations_WhenParticipantHasReadCursor_ReturnsRemainingUnreadCount() {
        when(authenticatedAccountProvider.requireCurrentAccount()).thenReturn(instructor);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Conversation> conversationPage = new PageImpl<>(List.of(conversation));
        when(conversationRepository.findActiveConversationsByAccountId(instructorId, pageable)).thenReturn(conversationPage);

        LocalDateTime readTime = LocalDateTime.now().minusMinutes(5);
        Message lastReadMsg = Message.builder().id(UUID.randomUUID()).createdAt(readTime).build();

        ConversationParticipant participant = ConversationParticipant.builder()
                .id(UUID.randomUUID())
                .conversation(conversation)
                .account(instructor)
                .lastReadAt(readTime)
                .lastReadMessage(lastReadMsg)
                .build();

        when(participantRepository.findByConversationIdAndAccountId(conversationId, instructorId))
                .thenReturn(Optional.of(participant));

        when(messageRepository.countUnreadForParticipant(conversationId, instructorId, readTime, lastReadMsg.getId()))
                .thenReturn(1L);

        ConversationSummaryResponse expectedResponse = ConversationSummaryResponse.builder()
                .id(conversationId)
                .unreadCount(1L)
                .build();

        when(conversationMapper.toSummaryResponse(conversation, instructorId, 1L))
                .thenReturn(expectedResponse);

        Page<ConversationSummaryResponse> result = conversationService.getMyConversations(pageable);

        assertThat(result.getContent().get(0).getUnreadCount()).isEqualTo(1L);
        verify(messageRepository).countUnreadForParticipant(conversationId, instructorId, readTime, lastReadMsg.getId());
    }

    @Test
    @DisplayName("F. Conversation chưa có tin nhắn nào -> unreadCount bằng 0")
    void testGetMyConversations_WhenNoMessages_ReturnsZeroUnread() {
        when(authenticatedAccountProvider.requireCurrentAccount()).thenReturn(student);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Conversation> conversationPage = new PageImpl<>(List.of(conversation));
        when(conversationRepository.findActiveConversationsByAccountId(studentId, pageable)).thenReturn(conversationPage);

        ConversationParticipant participant = ConversationParticipant.builder()
                .id(UUID.randomUUID())
                .conversation(conversation)
                .account(student)
                .build();

        when(participantRepository.findByConversationIdAndAccountId(conversationId, studentId))
                .thenReturn(Optional.of(participant));

        when(messageRepository.countUnreadForParticipant(conversationId, studentId, null, null))
                .thenReturn(0L);

        ConversationSummaryResponse expectedResponse = ConversationSummaryResponse.builder()
                .id(conversationId)
                .unreadCount(0L)
                .build();

        when(conversationMapper.toSummaryResponse(conversation, studentId, 0L))
                .thenReturn(expectedResponse);

        Page<ConversationSummaryResponse> result = conversationService.getMyConversations(pageable);

        assertThat(result.getContent().get(0).getUnreadCount()).isEqualTo(0L);
    }
}
