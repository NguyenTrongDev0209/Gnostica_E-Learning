package com.gnostica.modules.course.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class QuizRequest {
    private Integer id;
    private String title;

    private List<Integer> questionIds; // danh sách ID câu hỏi được chọn
}
