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
public class AttachmentResponse {
    private Integer id;
    private String fileUrl;
    private String fileType;
    private LocalDateTime createdAt;
}
