package com.gnostica.modules.wallet.dto.request;

import lombok.Data;

@Data
public class SetBankAccountRequest {
    private String bin;
    private String accountNumber;
    private String name;
    private String pin;
}
