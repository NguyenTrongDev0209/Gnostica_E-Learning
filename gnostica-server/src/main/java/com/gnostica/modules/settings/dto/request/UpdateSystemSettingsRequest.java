package com.gnostica.modules.settings.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Map;

@Data
public class UpdateSystemSettingsRequest {

    @NotNull
    @Size(max = 30)
    private Map<String, String> values;
}
