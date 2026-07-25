package com.gnostica.modules.gift.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GiftDetailResponse {
    private UUID giftId;
    private String senderName;
    private String senderAvatar;
    private String courseTitle;
    private String courseThumbnail;
    private String courseSlug;
    private BigDecimal coursePrice;
    private String message;
    private int status;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
}
