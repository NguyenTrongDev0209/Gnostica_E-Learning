package com.gnostica.modules.messaging.event.payload;

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
public class ConversationReadEventPayload {
    private UUID conversationId;
    private UUID readerAccountId;
    private UUID lastReadMessageId;
    private LocalDateTime lastReadAt;
}
