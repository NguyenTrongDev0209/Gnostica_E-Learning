package com.gnostica.modules.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCourseReportResponse {
    private String id; // report UUID as string or integer
    private String courseId;
    private String courseSlug;
    private String courseTitle;
    private String thumbnail;
    private String instructorName;
    private String reporterName;
    private String reportDetails; // reason from Report entity
    private LocalDateTime createdAt;
    private String status; // "pending", "resolved", "dismissed"
}
