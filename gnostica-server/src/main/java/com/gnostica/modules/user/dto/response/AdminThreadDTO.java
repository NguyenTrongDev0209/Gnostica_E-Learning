package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminThreadDTO {
    private Integer threadId;
    private String topicName;
    private String title;
    private Integer viewCount;
    private long likes;
    private long commentCount;
    private Integer sharedCount;
    private LocalDateTime createdAt;
    private Integer status;
}
