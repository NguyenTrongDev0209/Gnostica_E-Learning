package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLessonProgressDTO {
    private Integer lessonId;
    private String title;
    private Integer sortOrder;
    private String duration;
    private Integer progressPercent;
    private LocalDateTime completedDate;
    private String status;
}
