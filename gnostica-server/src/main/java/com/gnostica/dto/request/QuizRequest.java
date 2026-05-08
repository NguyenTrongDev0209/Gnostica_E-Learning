package com.gnostica.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class QuizRequest {
    private Integer id;
    private String title;
    private Integer duration; // phút, mặc định 15
    private Double passingScore; // điểm đạt, mặc định 8.0
    private Integer maxAttempts; // số lần thử, mặc định 3
    private List<Integer> questionIds; // danh sách ID câu hỏi được chọn
}
