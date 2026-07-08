package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.service.PaymentStrategyFactory;
import com.gnostica.modules.payment.service.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentStrategyFactoryImpl implements PaymentStrategyFactory {

    private final List<PaymentStrategy> strategies;

    @Override
    public PaymentStrategy getStrategy(String gatewayName) {
        return strategies.stream()
                .filter(s -> s.getGatewayName().equalsIgnoreCase(gatewayName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown payment gateway: " + gatewayName));
    }
}
