package com.gnostica.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class InstructorApplicationRequest {

    @NotBlank(message = "Email is required to identify user")
    private String email;

    @NotBlank(message = "Front ID card is required")
    private String idCardFront;

    @NotBlank(message = "Back ID card is required")
    private String idCardBack;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^(0|\\+84)(\\s|\\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\\d)(\\s|\\.)?(\\d{3})(\\s|\\.)?(\\d{3})$", message = "Invalid phone number format")
    private String contactPhone;

    @NotBlank(message = "CV URL is required")
    private String cvUrl;

    @NotBlank(message = "Bằng cấp chuyên môn là bắt buộc")
    private String degreeUrls;

    private String certificateUrls; // Danh sách chứng chỉ tin học, tiếng Anh, sư phạm... (Optional)

    private String sampleVideoUrl; // Optional/Required depending on business

    private String courseOutline;

}
