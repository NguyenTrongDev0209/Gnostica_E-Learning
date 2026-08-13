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
public class InstructorReviewReplyDTO {
    private Integer id;
    private String studentName;
    private String studentAvatar;
    private String content;
    private LocalDateTime createdAt;
    private Boolean isAuthor;
    private java.util.List<InstructorReviewReplyDTO> replies;
}
