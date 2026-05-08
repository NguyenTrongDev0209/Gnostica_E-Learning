package com.gnostica.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CourseRequest {
    private Integer id;

    @NotBlank(message = "Tên khóa học là bắt buộc")
    private String title;

    @NotBlank(message = "Slug không được để trống")
    private String slug;

    @NotBlank(message = "Mô tả khóa học không được để trống")
    private String description;

    @NotBlank(message = "Ảnh đại diện khóa học không được để trống")
    private String thumbnail;

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 0, message = "Giá bán phải lớn hơn hoặc bằng 0")
    private Double price;

    @Min(value = 0, message = "Giảm giá không được nhỏ hơn 0")
    @Max(value = 100, message = "Giảm giá không được quá 100%")
    private Integer discount;

    @NotNull(message = "Vui lòng chọn danh mục")
    private Integer categoryId;

    private String level;
    
    private String promoVideo;

    private Integer status;

    @Valid
    @NotEmpty(message = "Cần có ít nhất 1 chương học")
    private List<ModuleRequest> sections;

    private List<com.gnostica.dto.response.QuestionDto> questionBank;
}
