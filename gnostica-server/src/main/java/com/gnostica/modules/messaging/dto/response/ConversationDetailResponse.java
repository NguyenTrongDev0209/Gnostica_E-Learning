package com.gnostica.modules.messaging.dto.response;

import com.gnostica.core.model.enums.ParticipantRole;
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
public class ConversationDetailResponse {
    private UUID id;
    private CourseConversationSummaryResponse course;
    private ParticipantSummaryResponse student;
    private ParticipantSummaryResponse instructor;
    private ParticipantRole currentParticipantRole;
    private LastMessageSummaryResponse lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
}
