package com.gnostica.modules.settings.dto.request;
import jakarta.validation.constraints.*; import lombok.Data; import java.util.Map;
@Data public class TermModuleRequest { @NotBlank @Size(max=255) private String title; @NotNull @Min(0) private Integer sortOrder; @NotNull @Min(0) @Max(1) private Integer status; private Map<String,Object> metadata; }
