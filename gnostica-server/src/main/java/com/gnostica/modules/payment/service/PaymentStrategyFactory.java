package com.gnostica.modules.payment.service;

public interface PaymentStrategyFactory {
    PaymentStrategy getStrategy(String gatewayName);
}
