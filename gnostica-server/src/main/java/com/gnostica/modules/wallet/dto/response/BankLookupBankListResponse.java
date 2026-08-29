package com.gnostica.modules.wallet.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BankLookupBankListResponse {
    private Integer code;
    private Boolean success;
    private String msg;
    private List<BankLookupBankDto> data;
}
