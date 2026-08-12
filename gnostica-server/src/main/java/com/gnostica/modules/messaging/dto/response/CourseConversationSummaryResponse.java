package com.gnostica.modules.messaging.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseConversationSummaryResponse {
    private UUID courseId;
    private String title;
    private String slug;
    private String thumbnail;
}
