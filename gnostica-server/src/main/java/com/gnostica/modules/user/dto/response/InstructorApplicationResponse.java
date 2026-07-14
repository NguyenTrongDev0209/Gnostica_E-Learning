package com.gnostica.modules.user.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class InstructorApplicationResponse {
    private UUID accountId;
    private String email;
    private String fullName;
    private String idCardFront;
    private String idCardBack;
    private String contactPhone;
    private String cvUrl;
    private String degreeUrls;
    private String certificateUrls;
    private String sampleVideoUrl;
    private String courseOutline;
    private String status;
    private String rejectionReason;
    private String createdAt;
}
