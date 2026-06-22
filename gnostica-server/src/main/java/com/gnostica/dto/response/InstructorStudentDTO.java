package com.gnostica.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorStudentDTO {
    private Integer id;
    private String name;
    private String email;
    private String avatar;
    private long coursesCount;
    private int progress;
    private LocalDateTime joinedDate;
    private String lastActive;
}
