package com.gnostica.modules.payment.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import com.gnostica.modules.payment.service.PaymentStrategy;
import com.gnostica.modules.payment.service.PaymentStrategyFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentCaptor;

class PaymentServiceImplVNPayTests {
    private PaymentStrategy strategy;
    private OrderRepository orderRepository;
    private PaymentRepository paymentRepository;
    private ApplicationEventPublisher eventPublisher;
    private PaymentServiceImpl service;

    @BeforeEach
    void setUp() throws Exception {
        PaymentStrategyFactory factory = mock(PaymentStrategyFactory.class);
        strategy = mock(PaymentStrategy.class);
        orderRepository = mock(OrderRepository.class);
        paymentRepository = mock(PaymentRepository.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        when(factory.getStrategy("VNPAY")).thenReturn(strategy);
        service = new PaymentServiceImpl(factory, orderRepository, paymentRepository, eventPublisher, new ObjectMapper());
    }

    @Test
    void processesValidIpnExactlyOnce() throws Exception {
        Order order = order(OrderStatus.PENDING);
        when(strategy.verifyWebhook(any())).thenReturn(successfulWebhook());
        when(orderRepository.findByOrderCodeForUpdate(123L)).thenReturn(Optional.of(order));
        when(paymentRepository.existsByGatewayAndGatewayTransactionNo("VNPAY", "TX-1")).thenReturn(false);

        VNPayIpnResponse response = service.handleVNPayIpn(Map.of());

        assertThat(response.responseCode()).isEqualTo("00");
        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        ArgumentCaptor<Payment> payment = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(payment.capture());
        assertThat(payment.getValue().getGateway()).isEqualTo("VNPAY");
        assertThat(payment.getValue().getGatewayTransactionNo()).isEqualTo("TX-1");
        verify(eventPublisher).publishEvent(any());
    }

    @Test
    void acknowledgesAlreadyProcessedOrderWithoutDuplicatingRevenue() throws Exception {
        Order order = order(OrderStatus.PAID);
        when(strategy.verifyWebhook(any())).thenReturn(successfulWebhook());
        when(orderRepository.findByOrderCodeForUpdate(123L)).thenReturn(Optional.of(order));

        VNPayIpnResponse response = service.handleVNPayIpn(Map.of());

        assertThat(response.responseCode()).isEqualTo("02");
        verify(paymentRepository, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void rejectsMismatchedAmount() throws Exception {
        Order order = order(OrderStatus.PENDING);
        PaymentWebhookData callback = successfulWebhook();
        callback.setAmount(49_000L);
        when(strategy.verifyWebhook(any())).thenReturn(callback);
        when(orderRepository.findByOrderCodeForUpdate(123L)).thenReturn(Optional.of(order));

        assertThat(service.handleVNPayIpn(Map.of()).responseCode()).isEqualTo("04");
        verify(eventPublisher, never()).publishEvent(any());
    }

    private Order order(int status) {
        return Order.builder()
                .orderCode(123L)
                .paymentMethod("VNPAY")
                .totalPrice(BigDecimal.valueOf(50_000L))
                .status(status)
                .build();
    }

    private PaymentWebhookData successfulWebhook() {
        return PaymentWebhookData.builder()
                .orderCode(123L)
                .transactionCode("TX-1")
                .amount(50_000L)
                .status("PAID")
                .build();
    }
}
