package com.gnostica.modules.messaging.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.Message;
import com.gnostica.core.model.Role;
import com.gnostica.core.model.enums.MessageType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageRepositoryUnreadQueryTest {

    @Mock
    private MessageRepository messageRepository;

    private UUID conversationId;
    private UUID instructorId;
    private UUID studentId;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        conversationId = UUID.randomUUID();
        instructorId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        now = LocalDateTime.now();
    }

    @Test
    @DisplayName("A & C & D: countAllUnreadMessages đếm tin chưa đọc khi lastReadAt = null, bỏ qua sender của chính mình và tin đã xóa")
    void testCountAllUnreadMessages_Behavior() {
        when(messageRepository.countAllUnreadMessages(conversationId, instructorId)).thenReturn(3L);
        when(messageRepository.countUnreadForParticipant(conversationId, instructorId, null, null)).thenCallRealMethod();

        long unread = messageRepository.countUnreadForParticipant(conversationId, instructorId, null, null);

        assertThat(unread).isEqualTo(3L);
        verify(messageRepository).countAllUnreadMessages(conversationId, instructorId);
        verify(messageRepository, never()).countUnreadMessagesAfterCursor(any(), any(), any(), any());
    }

    @Test
    @DisplayName("B & E: countUnreadMessagesAfterCursor đếm tin nhắn sau read cursor bằng tuple comparison (createdAt, id)")
    void testCountUnreadMessagesAfterCursor_Behavior() {
        UUID lastReadMsgId = UUID.randomUUID();

        when(messageRepository.countUnreadMessagesAfterCursor(conversationId, instructorId, now, lastReadMsgId)).thenReturn(1L);
        when(messageRepository.countUnreadForParticipant(conversationId, instructorId, now, lastReadMsgId)).thenCallRealMethod();

        long unread = messageRepository.countUnreadForParticipant(conversationId, instructorId, now, lastReadMsgId);

        assertThat(unread).isEqualTo(1L);
        verify(messageRepository).countUnreadMessagesAfterCursor(conversationId, instructorId, now, lastReadMsgId);
        verify(messageRepository, never()).countAllUnreadMessages(any(), any());
    }
}
