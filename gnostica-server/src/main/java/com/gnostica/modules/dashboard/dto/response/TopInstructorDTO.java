package com.gnostica.modules.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopInstructorDTO {
    private UUID id;
    private String name;
    private String avatar;
    private Integer completion;
    private Integer learning;
    private Integer refund;
}
