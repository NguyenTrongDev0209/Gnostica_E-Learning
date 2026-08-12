package com.gnostica.modules.messaging.event.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ConversationReadDomainEvent {
    private final UUID conversationId;
    private final UUID readerAccountId;
    private final String readerEmail;
    private final UUID otherAccountId;
    private final String otherEmail;
    private final UUID lastReadMessageId;
    private final LocalDateTime lastReadAt;
}
