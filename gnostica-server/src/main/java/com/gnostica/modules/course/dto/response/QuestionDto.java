package com.gnostica.modules.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Integer id; // Can be a temporary ID from frontend or DB ID
    private String text; // maps to content in backend
    private Map<String, String> options; // Key: A/B/C/D, Value: answerText
    private String correct; // e.g. "A", "B", "C", "D"
    private String level; // "easy", "medium", "hard"
    private String explanation; // Giải thích chi tiết
}
