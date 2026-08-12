package com.gnostica.modules.messaging.event.payload;

import com.gnostica.core.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationUpdatedEventPayload {
    private UUID conversationId;
    private UUID lastMessageId;
    private UUID lastMessageSenderId;
    private MessageType lastMessageType;
    private String lastMessageText;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
