package com.gnostica.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDTO {
    private Integer id;
    private Integer courseId;
    private String courseTitle;
    private String courseSlug;
    private String courseThumbnail;
    private String instructorName;
    private Integer progressPercent;
    private LocalDateTime completedAt;
    private LocalDateTime joinedAt; 
    private String lastWatchedLessonSlug;
    private String firstLessonId;
}
