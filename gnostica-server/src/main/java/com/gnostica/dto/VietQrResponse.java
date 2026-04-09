package com.gnostica.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VietQrResponse {
    private String code;
    private String desc;
    private List<VietQrBankDto> data;
}
