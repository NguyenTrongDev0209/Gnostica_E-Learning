package com.gnostica.payload.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InstructorApplicationResponse {
    private Integer id;
    private String email;
    private String fullName;
    private String idCardFront;
    private String idCardBack;
    private String contactPhone;
    private String cvUrl;
    private String degreeUrls;
    private String sampleVideoUrl;
    private String courseOutline;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
