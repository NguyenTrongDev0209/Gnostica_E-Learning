package com.gnostica.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonProgressDTO {
    private Integer lessonId;
    private Boolean isCompleted;
    private Integer lastWatchedTime;
    private java.time.LocalDateTime updatedAt;
}
