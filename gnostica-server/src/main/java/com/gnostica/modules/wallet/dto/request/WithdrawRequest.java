package com.gnostica.modules.wallet.dto.request;

import lombok.Data;

@Data
public class WithdrawRequest {
    private Long amount;
    private String pin;
}
