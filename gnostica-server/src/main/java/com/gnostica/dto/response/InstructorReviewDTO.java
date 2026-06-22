package com.gnostica.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorReviewDTO {
    private Integer id;
    private String studentName;
    private String studentAvatar;
    private String courseName;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
    private String status; // responded | not_responded
}
