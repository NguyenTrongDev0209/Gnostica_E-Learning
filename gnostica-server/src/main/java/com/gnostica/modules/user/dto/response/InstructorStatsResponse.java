package com.gnostica.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStatsResponse {
    private java.util.UUID id;
    private String fullName;
    private String email;
    private String avatar;
    private long coursesCount;
    private long studentsCount;
    private double rating;
    private String title;
    private String bio;
}
