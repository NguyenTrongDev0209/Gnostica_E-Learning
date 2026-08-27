package com.gnostica.modules.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseReportRequest {
    @NotBlank(message = "Lý do báo cáo không được để trống")
    private String reason;
}
