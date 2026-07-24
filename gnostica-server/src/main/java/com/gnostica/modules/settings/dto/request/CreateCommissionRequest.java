package com.gnostica.modules.settings.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateCommissionRequest {
    @NotNull
    @DecimalMin("0")
    @DecimalMax("100")
    private BigDecimal platformRatio;

    @NotNull
    @DecimalMin("0")
    @DecimalMax("100")
    private BigDecimal instructorRatio;

    @NotNull
    private Integer applyAfterDays;
}
