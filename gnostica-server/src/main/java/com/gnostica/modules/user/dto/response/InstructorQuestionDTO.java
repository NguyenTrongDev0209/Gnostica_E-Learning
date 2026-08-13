package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

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
    private String targetId; // Thêm ID bài học
    private String content;
    private LocalDateTime createdAt;
    private String status; // answered | unanswered
    private Boolean isHidden; // Ẩn hoặc Hiện
    private Integer likes;
    private List<InstructorQuestionReplyDTO> replies; // Danh sách trả lời
}
