package com.gnostica.modules.payment.service.impl;
import com.gnostica.service.*;

import com.gnostica.modules.payment.service.PaymentStrategyFactoryService;
import com.gnostica.modules.payment.service.PaymentStrategyService;
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
