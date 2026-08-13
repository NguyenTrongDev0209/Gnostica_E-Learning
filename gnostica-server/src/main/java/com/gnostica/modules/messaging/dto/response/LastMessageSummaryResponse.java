package com.gnostica.modules.messaging.dto.response;

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
public class LastMessageSummaryResponse {
    private UUID messageId;
    private UUID senderId;
    private MessageType type;
    private String contentPreview;
    private LocalDateTime createdAt;
}
