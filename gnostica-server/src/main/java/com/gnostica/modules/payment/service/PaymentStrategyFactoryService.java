package com.gnostica.modules.payment.service;
import com.gnostica.service.*;

public interface PaymentStrategyFactoryService {
    PaymentStrategyService getStrategy(String gatewayName);
}
