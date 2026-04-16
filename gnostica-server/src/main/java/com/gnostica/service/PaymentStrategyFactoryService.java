package com.gnostica.service;

public interface PaymentStrategyFactoryService {
    PaymentStrategyService getStrategy(String gatewayName);
}
