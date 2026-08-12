package com.gnostica.modules.messaging.dto.response;

import com.gnostica.core.model.enums.ParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantSummaryResponse {
    private UUID accountId;
    private String fullName;
    private String avatar;
    private ParticipantRole role;
}
