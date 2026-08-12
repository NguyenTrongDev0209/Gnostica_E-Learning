package com.gnostica.modules.messaging.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {
    @NotNull(message = "ID khóa học không được để trống")
    private UUID courseId;

    private UUID studentId;
}
