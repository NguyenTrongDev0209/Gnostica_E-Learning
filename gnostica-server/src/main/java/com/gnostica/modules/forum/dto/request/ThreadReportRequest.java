package com.gnostica.modules.forum.dto.request;
import com.gnostica.service.*;

import lombok.Data;

@Data
public class ThreadReportRequest {
    private Integer threadId;
    private String userEmail;
    private String type;
    private String details;
}
