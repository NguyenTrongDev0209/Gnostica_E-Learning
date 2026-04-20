package com.gnostica.service.impl;

import com.gnostica.service.PaymentStrategyFactoryService;
import com.gnostica.service.PaymentStrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentStrategyFactoryImpl implements PaymentStrategyFactoryService {

    private final List<PaymentStrategyService> strategies;

    @Override
    public PaymentStrategyService getStrategy(String gatewayName) {
        return strategies.stream()
                .filter(s -> s.getGatewayName().equalsIgnoreCase(gatewayName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown payment gateway: " + gatewayName));
    }
}
