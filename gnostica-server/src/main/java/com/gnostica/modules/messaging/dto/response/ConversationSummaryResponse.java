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
public class ConversationSummaryResponse {
    private UUID id;
    private CourseConversationSummaryResponse course;
    private ParticipantSummaryResponse otherParticipant;
    private LastMessageSummaryResponse lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
    private LocalDateTime createdAt;
}
