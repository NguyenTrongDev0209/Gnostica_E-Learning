package com.gnostica.modules.course.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String thumbnail;
    private BigDecimal price;
    private Integer discount;
    private BigDecimal salePrice;
    private String level;
    private String metadata;
    private Integer status;
    private Boolean deleted;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonProperty("isEnrolled")
    private Boolean isEnrolled;

    private Integer categoryId;
    private String categoryName;
    
    private UUID instructorId;
    private String instructorName;
    private String instructorAvatar;
    private String instructorEmail;
    private String instructorPhone;
    private LocalDateTime instructorCreatedAt;

    private Integer classes;
    private Integer students;
}
