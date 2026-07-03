package com.gnostica.modules.payment.service;

public interface PaymentStrategyFactoryService {
    PaymentStrategyService getStrategy(String gatewayName);
}
