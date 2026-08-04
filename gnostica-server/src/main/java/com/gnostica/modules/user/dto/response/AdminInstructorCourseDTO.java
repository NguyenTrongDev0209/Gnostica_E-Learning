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
public class AdminInstructorCourseDTO {
    private UUID courseId;
    private String title;
    private String thumbnail;
    private BigDecimal price;
    private Integer discount;
    private long studentCount;
    private BigDecimal revenue;
    private LocalDateTime createdAt;
    private Integer status;
}
