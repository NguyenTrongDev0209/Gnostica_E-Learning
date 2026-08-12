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
public class MessageCreatedEventPayload {
    private UUID messageId;
    private UUID conversationId;
    private UUID senderId;
    private String senderName;
    private String senderAvatar;
    private UUID clientMessageId;
    private MessageType type;
    private String content;
    private LocalDateTime createdAt;
}
