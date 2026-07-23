package com.gnostica.modules.settings.dto.request;
import jakarta.validation.constraints.*; import lombok.Data; import java.util.Map;
@Data public class TermRequest { @NotNull private Integer termModuleId; @NotBlank @Size(max=255) private String title; @NotBlank @Size(max=255) @Pattern(regexp="^[a-z0-9]+(?:-[a-z0-9]+)*(?:/[a-z0-9]+(?:-[a-z0-9]+)*)*$") private String urlPath; @NotBlank @Size(max=200000) private String content; @NotNull @Min(0) private Integer sortOrder; @NotNull @Min(0) @Max(1) private Integer status; private Map<String,Object> metadata; }
