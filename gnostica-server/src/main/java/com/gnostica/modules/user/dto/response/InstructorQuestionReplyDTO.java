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
public class InstructorQuestionReplyDTO {
    private Integer id;
    private String content;
    private String studentName;
    private String studentAvatar;
    private LocalDateTime createdAt;
    private Boolean isAuthor; // Xác định nếu trả lời là của giảng viên
}
