package com.gnostica.modules.wallet.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BankLookupBankDto {
    private String id;
    private String name;
    private Integer bin;
    private String code;

    @JsonProperty("short_name")
    private String shortName;

    @JsonProperty("lookup_supported")
    private Integer lookupSupported;
}
