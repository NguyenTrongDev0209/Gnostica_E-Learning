package com.gnostica.modules.forum.dto.request;

import lombok.Data;

@Data
public class ThreadReportRequest {
    private Integer threadId;
    private String userEmail;
    private String type;
    private String details;
}
