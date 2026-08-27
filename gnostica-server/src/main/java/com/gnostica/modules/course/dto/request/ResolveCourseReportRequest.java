package com.gnostica.modules.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResolveCourseReportRequest {
    @NotBlank(message = "Hành động không được để trống")
    private String action; // "HIDE_COURSE" or "DISMISS"
    
    private String reason; // (optional) additional reason
}
