package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEnrollmentDTO {
    private Integer enrollmentId;
    private UUID courseId;
    private String courseTitle;
    private String courseThumbnail;
    private String instructorName;
    private String orderCode;
    private LocalDateTime enrollDate;
    private Integer progressPercent;
    private Integer status;
}
