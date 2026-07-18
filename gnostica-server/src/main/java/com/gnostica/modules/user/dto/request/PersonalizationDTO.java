package com.gnostica.modules.user.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class PersonalizationDTO {
    private String level;
    private List<Integer> categoryIds;
}
