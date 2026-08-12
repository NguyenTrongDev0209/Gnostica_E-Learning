package com.gnostica.modules.messaging.dto.response;

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
public class ConversationReadResponse {
    private UUID conversationId;
    private UUID accountId;
    private UUID lastReadMessageId;
    private LocalDateTime lastReadAt;
    private long unreadCount;
}
