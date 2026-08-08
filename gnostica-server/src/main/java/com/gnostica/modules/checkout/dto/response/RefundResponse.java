package com.gnostica.modules.checkout.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
public class RefundResponse {
    private UUID id;
    private Long orderCode;
    private UUID courseId;
    private String courseTitle;
    private Long amount;
    private String reason;
    private Integer status;
    private String statusLabel;
    private Date createdAt;
    private Date updatedAt;
    private Date paidAt;
}
