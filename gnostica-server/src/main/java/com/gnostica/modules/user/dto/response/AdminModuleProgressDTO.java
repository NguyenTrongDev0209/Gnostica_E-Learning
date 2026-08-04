package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminModuleProgressDTO {
    private Integer moduleId;
    private String title;
    private Integer sortOrder;
    private int totalLessons;
    private int completedLessons;
    private int progressPercent;
    private LocalDateTime completedDate;
    private String status;
    private List<AdminLessonProgressDTO> lessons;
}
