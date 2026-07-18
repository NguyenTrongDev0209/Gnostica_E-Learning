package com.gnostica.modules.course.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateDTO {
    private String certifiUrl;
    private String courseTitle;
    private String studentName;
    private String instructorName;
    private LocalDateTime completedAt;
}
