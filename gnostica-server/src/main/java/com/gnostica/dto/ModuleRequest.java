package com.gnostica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ModuleRequest {
    private Integer id;

    @NotBlank(message = "Tên chương không được để trống")
    private String title;

    // Optional URL string provided by the React form representing the attachment
    private String attachments;

    private Integer status;

    @Valid
    @NotEmpty(message = "Chương này phải có ít nhất 1 bài học")
    private List<LessonRequest> lessons;
}
