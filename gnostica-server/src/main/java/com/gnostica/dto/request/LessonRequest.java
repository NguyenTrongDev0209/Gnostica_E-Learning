package com.gnostica.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LessonRequest {
    private Integer id;

    @NotBlank(message = "Tên bài học không được để trống")
    private String title;

    @NotBlank(message = "Mô tả nội dung bài học không được để trống")
    private String content;

    @NotBlank(message = "Video bài học không được để trống")
    private String videoUrl;

    private Integer status;
}
