package com.gnostica.modules.checkout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private UUID id;
    private UUID courseId;
    private String courseName;
    private BigDecimal price;
    private Integer discount;
    private Integer status;
    private LocalDateTime createdAt;
}

