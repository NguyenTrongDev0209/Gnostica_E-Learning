package com.gnostica.modules.wallet.dto.request;

import lombok.Data;

@Data
public class BankLookupRequest {
    private String bin;
    private String accountNumber;
}
