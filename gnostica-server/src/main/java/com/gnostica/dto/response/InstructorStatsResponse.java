package com.gnostica.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStatsResponse {
    private Integer id;
    private String fullName;
    private String email;
    private String avatar;
    private long coursesCount;
    private long studentsCount;
    private double rating;
}
