package com.gnostica.modules.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewReplyRequest {

    @NotNull(message = "Parent review ID is required")
    private Integer parentReviewId;

    @NotBlank(message = "Comment cannot be blank")
    private String comment;
}
