package com.gnostica.modules.messaging.event;

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
public class MessagingEventEnvelope<T> {
    private UUID eventId;
    private MessagingEventType type;
    private UUID conversationId;
    private LocalDateTime occurredAt;
    private T data;
}
