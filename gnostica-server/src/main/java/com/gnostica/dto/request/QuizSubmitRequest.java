package com.gnostica.dto.request;

import lombok.Data;

@Data
public class QuizSubmitRequest {
    private Double point;
    private Integer totalQuestions;
    private Integer correctAnswers;
}
