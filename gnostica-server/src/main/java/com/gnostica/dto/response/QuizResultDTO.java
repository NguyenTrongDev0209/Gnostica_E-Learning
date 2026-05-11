package com.gnostica.dto.response;

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
    private Double point;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private java.time.LocalDateTime completedAt;
}
