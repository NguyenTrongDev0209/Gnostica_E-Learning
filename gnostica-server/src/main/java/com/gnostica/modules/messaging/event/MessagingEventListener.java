package com.gnostica.modules.messaging.event;

import com.gnostica.modules.messaging.event.domain.ConversationReadDomainEvent;
import com.gnostica.modules.messaging.event.domain.MessageCreatedDomainEvent;
import com.gnostica.modules.messaging.event.payload.ConversationReadEventPayload;
import com.gnostica.modules.messaging.event.payload.ConversationUpdatedEventPayload;
import com.gnostica.modules.messaging.event.payload.MessageCreatedEventPayload;
import com.gnostica.modules.messaging.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.UUID;

import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.core.model.Message;
import com.gnostica.modules.messaging.repository.ConversationParticipantRepository;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessagingEventListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final ConversationParticipantRepository participantRepository;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMessageCreated(MessageCreatedDomainEvent event) {
        if (!event.isCreatedNew()) {
            log.debug("Skip publishing MESSAGE_CREATED for idempotent retry of message: {}", event.getMessageId());
            return;
        }

        try {
            MessageCreatedEventPayload messagePayload = MessageCreatedEventPayload.builder()
                    .messageId(event.getMessageId())
                    .conversationId(event.getConversationId())
                    .senderId(event.getSenderId())
                    .senderName(event.getSenderName())
                    .senderAvatar(event.getSenderAvatar())
                    .clientMessageId(event.getClientMessageId())
                    .type(event.getType())
                    .content(event.getContent())
                    .createdAt(event.getCreatedAt())
                    .build();

            MessagingEventEnvelope<MessageCreatedEventPayload> messageEnvelope = MessagingEventEnvelope.<MessageCreatedEventPayload>builder()
                    .eventId(UUID.randomUUID())
                    .type(MessagingEventType.MESSAGE_CREATED)
                    .conversationId(event.getConversationId())
                    .occurredAt(LocalDateTime.now())
                    .data(messagePayload)
                    .build();

            // Send MESSAGE_CREATED to student and instructor on user queue
            if (event.getStudentEmail() != null) {
                messagingTemplate.convertAndSendToUser(event.getStudentEmail(), "/queue/messages", messageEnvelope);
            }
            if (event.getInstructorEmail() != null) {
                messagingTemplate.convertAndSendToUser(event.getInstructorEmail(), "/queue/messages", messageEnvelope);
            }

            // Send CONVERSATION_UPDATED recipient-specific payload with dynamic unread count
            sendConversationUpdated(event.getConversationId(), event.getStudentAccountId(), event.getStudentEmail(), event);
            sendConversationUpdated(event.getConversationId(), event.getInstructorAccountId(), event.getInstructorEmail(), event);

        } catch (Exception e) {
            log.error("Failed to publish MESSAGE_CREATED realtime event for conversation {}: {}", event.getConversationId(), e.getMessage());
        }
    }

    private void sendConversationUpdated(UUID conversationId, UUID accountId, String email, MessageCreatedDomainEvent event) {
        if (email == null || accountId == null) return;
        try {
            Optional<ConversationParticipant> participantOpt = participantRepository.findByConversationIdAndAccountId(conversationId, accountId);
            LocalDateTime lastReadAt = participantOpt.map(ConversationParticipant::getLastReadAt).orElse(null);
            UUID lastReadMsgId = participantOpt.map(ConversationParticipant::getLastReadMessage).map(Message::getId).orElse(null);

            long unreadCount = messageRepository.countUnreadForParticipant(conversationId, accountId, lastReadAt, lastReadMsgId);

            ConversationUpdatedEventPayload payload = ConversationUpdatedEventPayload.builder()
                    .conversationId(conversationId)
                    .lastMessageId(event.getMessageId())
                    .lastMessageSenderId(event.getSenderId())
                    .lastMessageType(event.getType())
                    .lastMessageText(event.getContent().length() > 1000 ? event.getContent().substring(0, 1000) : event.getContent())
                    .lastMessageAt(event.getCreatedAt())
                    .unreadCount(unreadCount)
                    .build();

            MessagingEventEnvelope<ConversationUpdatedEventPayload> envelope = MessagingEventEnvelope.<ConversationUpdatedEventPayload>builder()
                    .eventId(UUID.randomUUID())
                    .type(MessagingEventType.CONVERSATION_UPDATED)
                    .conversationId(conversationId)
                    .occurredAt(LocalDateTime.now())
                    .data(payload)
                    .build();

            messagingTemplate.convertAndSendToUser(email, "/queue/conversations", envelope);
        } catch (Exception e) {
            log.error("Failed to publish CONVERSATION_UPDATED realtime event to {}: {}", email, e.getMessage());
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleConversationRead(ConversationReadDomainEvent event) {
        try {
            ConversationReadEventPayload payload = ConversationReadEventPayload.builder()
                    .conversationId(event.getConversationId())
                    .readerAccountId(event.getReaderAccountId())
                    .lastReadMessageId(event.getLastReadMessageId())
                    .lastReadAt(event.getLastReadAt())
                    .build();

            MessagingEventEnvelope<ConversationReadEventPayload> envelope = MessagingEventEnvelope.<ConversationReadEventPayload>builder()
                    .eventId(UUID.randomUUID())
                    .type(MessagingEventType.CONVERSATION_READ)
                    .conversationId(event.getConversationId())
                    .occurredAt(LocalDateTime.now())
                    .data(payload)
                    .build();

            if (event.getReaderEmail() != null) {
                messagingTemplate.convertAndSendToUser(event.getReaderEmail(), "/queue/read-receipts", envelope);
            }
            if (event.getOtherEmail() != null) {
                messagingTemplate.convertAndSendToUser(event.getOtherEmail(), "/queue/read-receipts", envelope);
            }

        } catch (Exception e) {
            log.error("Failed to publish CONVERSATION_READ realtime event for conversation {}: {}", event.getConversationId(), e.getMessage());
        }
    }
}
