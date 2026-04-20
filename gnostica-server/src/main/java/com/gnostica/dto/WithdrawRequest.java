package com.gnostica.dto;

import lombok.Data;

@Data
public class WithdrawRequest {
    private String bin;
    private String accountNumber;
    private Long amount;
}
