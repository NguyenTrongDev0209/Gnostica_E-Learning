package com.gnostica.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDTO {
    private Integer id;
    private String name;
    private String slug;
    private Integer courses;
    private Boolean status;
    private LocalDateTime createdAt;
    private List<CategoryResponseDTO> subcategories;
}
