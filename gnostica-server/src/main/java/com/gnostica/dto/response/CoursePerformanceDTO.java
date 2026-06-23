package com.gnostica.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursePerformanceDTO {
    private Integer id;
    private String title;
    private Long students;
    private Double completed;
    private Double avgProgress;
    private Double rating;
    private String status;
}
