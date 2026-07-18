package com.gnostica.modules.auth.dto.request;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String bio;
    private String title;
    private String website;
    private String linkedin;
}
