package com.gnostica.modules.course.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseReviewResponse {
    private Integer id;
    private UUID accountId;
    private String studentName;
    private String studentAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
