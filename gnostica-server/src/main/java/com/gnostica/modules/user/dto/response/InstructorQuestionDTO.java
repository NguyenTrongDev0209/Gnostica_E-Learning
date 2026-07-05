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
public class InstructorQuestionDTO {
    private Integer id;
    private String studentName;
    private String studentAvatar;
    private String courseName;
    private String lessonName;
    private String content;
    private LocalDateTime createdAt;
    private String status; // answered | unanswered
    private Integer likes;
}
