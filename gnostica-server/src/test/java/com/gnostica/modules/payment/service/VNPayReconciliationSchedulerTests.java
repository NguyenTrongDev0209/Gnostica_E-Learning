package com.gnostica.modules.payment.service;

import com.gnostica.core.config.VNPayProperties;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class VNPayReconciliationSchedulerTests {
    private VNPayProperties properties;
    private OrderRepository orderRepository;
    private PaymentService paymentService;
    private VNPayReconciliationScheduler scheduler;

    @BeforeEach
    void setUp() {
        properties = new VNPayProperties();
        orderRepository = mock(OrderRepository.class);
        paymentService = mock(PaymentService.class);
        scheduler = new VNPayReconciliationScheduler(properties, orderRepository, paymentService);
    }

    @Test
    void pollsPendingVNPayOrdersWhenIpnUrlIsBlank() throws Exception {
        Order order = Order.builder().orderCode(123L).build();
        when(orderRepository.findTop50ByStatusAndPaymentMethodIgnoreCaseAndCreatedAtAfterOrderByCreatedAtAsc(
                eq(OrderStatus.PENDING), eq("VNPAY"), any(LocalDateTime.class)))
                .thenReturn(List.of(order));

        scheduler.reconcilePendingPaymentsWhenIpnIsUnavailable();

        verify(paymentService).checkPaymentStatus(order);
    }

    @Test
    void doesNotPollWhenIpnUrlIsConfigured() throws Exception {
        properties.setIpnUrl("https://example.com/api/payment/vnpay/ipn");

        scheduler.reconcilePendingPaymentsWhenIpnIsUnavailable();

        verifyNoInteractions(orderRepository, paymentService);
    }

    @Test
    void continuesWhenOneOrderCannotBeQueried() throws Exception {
        Order first = Order.builder().orderCode(1L).build();
        Order second = Order.builder().orderCode(2L).build();
        when(orderRepository.findTop50ByStatusAndPaymentMethodIgnoreCaseAndCreatedAtAfterOrderByCreatedAtAsc(
                eq(OrderStatus.PENDING), eq("VNPAY"), any(LocalDateTime.class)))
                .thenReturn(List.of(first, second));
        doThrow(new IllegalStateException("network error")).when(paymentService).checkPaymentStatus(first);

        scheduler.reconcilePendingPaymentsWhenIpnIsUnavailable();

        verify(paymentService).checkPaymentStatus(second);
    }
}
