package com.gnostica.modules.wallet.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class BankLookupOwnerResponse {
    private Integer code;
    private Boolean success;
    private String msg;
    private OwnerData data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OwnerData {
        private String ownerName;
    }
}
