package com.gnostica.modules.wallet.dto.response;
import com.gnostica.service.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VietQrBankDto {
    private Integer id;
    private String code;
    private String bin;
    private String shortName; // corresponds to JSON: shortName
    private String logo;      // corresponds to JSON: logo
}
