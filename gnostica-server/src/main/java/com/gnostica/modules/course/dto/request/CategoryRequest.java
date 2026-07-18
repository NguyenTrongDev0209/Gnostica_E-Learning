package com.gnostica.modules.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 255, message = "Tên danh mục không vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 255, message = "Slug không vượt quá 255 ký tự")
    private String slug;

    private Integer parent_id;
    
    private Boolean status;
}
