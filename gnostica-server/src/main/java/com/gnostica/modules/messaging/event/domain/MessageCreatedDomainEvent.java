package com.gnostica.modules.messaging.event.domain;

import com.gnostica.core.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class MessageCreatedDomainEvent {
    private final UUID conversationId;
    private final UUID messageId;
    private final UUID senderId;
    private final String senderName;
    private final String senderAvatar;
    private final UUID clientMessageId;
    private final MessageType type;
    private final String content;
    private final LocalDateTime createdAt;

    private final UUID studentAccountId;
    private final String studentEmail;
    private final UUID instructorAccountId;
    private final String instructorEmail;

    private final boolean createdNew;
}
