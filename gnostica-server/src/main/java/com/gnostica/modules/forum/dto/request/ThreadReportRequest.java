package com.gnostica.modules.forum.dto.request;

import lombok.Data;

@Data
public class ThreadReportRequest {
    private Integer threadId;
    private String userEmail;
    private String email;
    private String type;
    private String reason;
    private String details;
    private String detail;

    public String getEffectiveEmail() {
        return userEmail != null && !userEmail.isBlank() ? userEmail : email;
    }

    public String getEffectiveReason() {
        return reason != null && !reason.isBlank() ? reason : type;
    }

    public String getEffectiveDetails() {
        return details != null && !details.isBlank() ? details : detail;
    }
}
