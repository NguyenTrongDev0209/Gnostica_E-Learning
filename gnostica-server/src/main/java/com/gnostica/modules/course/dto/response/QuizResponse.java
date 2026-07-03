package com.gnostica.modules.course.dto.response;

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
public class QuizResponse {
    private Integer id;
    private String title;
    private LocalDateTime createdAt;
    private List<Integer> questionIds;
    private List<QuestionDto> questions;
}
