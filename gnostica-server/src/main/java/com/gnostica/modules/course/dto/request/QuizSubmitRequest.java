package com.gnostica.modules.course.dto.request;

import lombok.Data;

@Data
public class QuizSubmitRequest {
    private Double point;
    private Integer totalQuestions;
    private Integer correctAnswers;
}
