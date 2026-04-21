package com.gnostica.dto;

import lombok.Data;

@Data
public class WithdrawRequest {
    private Long amount;
    private String pin;
}
