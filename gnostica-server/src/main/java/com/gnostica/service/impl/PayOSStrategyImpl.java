package com.gnostica.service.impl;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.model.Order;
import com.gnostica.model.OrderDetail;
import com.gnostica.repository.OrderDetailRepository;
import com.gnostica.service.PaymentStrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayOSStrategyImpl implements PaymentStrategyService {

    private final PayOS payOS;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public PaymentLinkResponse createPaymentLink(Order order) throws Exception {
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);

        List<PaymentLinkItem> items = details.stream().map(d -> PaymentLinkItem.builder()
                .name(d.getCourse().getTitle())
                .quantity(1)
                .price((long) d.getPrice().doubleValue())
                .build()).collect(Collectors.toList());

        String baseUrl = "https://localhost:5173";
        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(Long.parseLong(order.getTransactionId()))
                .amount((long) order.getTotalPrice().doubleValue())
                .description("Thanh toan don hang " + order.getId())
                .items(items)
                .returnUrl(baseUrl + "/payment/success")
                .cancelUrl(baseUrl + "/payment/cancel")
                .build();

        CreatePaymentLinkResponse paymentLink = payOS.paymentRequests().create(paymentData);

        return PaymentLinkResponse.builder()
                .checkoutUrl(paymentLink.getCheckoutUrl())
                .paymentLinkId(paymentLink.getPaymentLinkId())
                .orderCode(paymentLink.getOrderCode())
                .status(paymentLink.getStatus().toString())
                .build();
    }

    @Override
    public WebhookData verifyWebhook(Object body) throws Exception {
        return payOS.webhooks().verify(body);
    }

    @Override
    public String getGatewayName() {
        return "PAYOS";
    }
}
