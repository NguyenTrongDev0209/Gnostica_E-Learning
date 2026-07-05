package com.gnostica.modules.forum.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThreadReportResponse {
    private Integer id;
    private Integer threadId;
    private String threadContent;
    private String reporterName;
    private String reporterEmail;
    private String type;
    private String details;
    private String status;
    private LocalDateTime createdAt;
}
