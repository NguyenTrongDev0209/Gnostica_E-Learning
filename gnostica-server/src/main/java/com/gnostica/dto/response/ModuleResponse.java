package com.gnostica.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse {
    private Integer id;
    private String title;
    private LocalDateTime createdAt;
    private Integer status;
    private Boolean deleted;
    private LocalDateTime updatedAt;
    private List<AttachmentResponse> attachments;
    private List<LessonResponse> lessons;
    private QuizResponse quiz;
}
