package com.gnostica.modules.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResultDTO {
    private Integer quizId;
    private java.math.BigDecimal point;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private java.time.LocalDateTime completedAt;
    private Integer status; // 1: In Progress (reset), 2: Submitted
}
