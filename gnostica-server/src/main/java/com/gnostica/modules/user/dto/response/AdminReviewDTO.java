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
public class AdminReviewDTO {
    private Integer reviewId;
    private String studentName;
    private String studentAvatar;
    private String courseTitle;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Integer status;
}
