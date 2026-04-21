package com.gnostica.dto;

import lombok.Data;

@Data
public class SetBankAccountRequest {
    private String bin;
    private String accountNumber;
    private String pin;
}
