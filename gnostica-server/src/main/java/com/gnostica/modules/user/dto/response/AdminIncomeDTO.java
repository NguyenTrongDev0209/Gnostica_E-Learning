package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminIncomeDTO {
    private UUID orderDetailId;
    private String orderCode;
    private String courseTitle;
    private String studentName;
    private String studentAvatar;
    private BigDecimal price;
    private BigDecimal instructorRatio;
    private BigDecimal incomeAmount;
    private LocalDateTime createdAt;
    private Integer status;
}
