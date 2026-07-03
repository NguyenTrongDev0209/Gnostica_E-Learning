package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.modules.payment.service.PaymentStrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.PaymentLink;
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

        String baseUrl = "http://localhost:5173";
        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(Long.parseLong(order.getTransactionId()))
                .amount((long) order.getTotalPrice().doubleValue())
                .description("Thanh toan don hang " + order.getId())
                .items(items)
                .returnUrl(baseUrl + "/payment/success")
                .cancelUrl(baseUrl + "/payment/cancel")
                .build();

        // Tạo link thanh toán
        CreatePaymentLinkResponse paymentLink = payOS.paymentRequests().create(paymentData);

        return PaymentLinkResponse.builder()
                .checkoutUrl(paymentLink.getCheckoutUrl())
                .paymentLinkId(paymentLink.getPaymentLinkId())
                .orderCode(paymentLink.getOrderCode())
                .status(paymentLink.getStatus().toString())
                .description(paymentLink.getDescription())
                .accountNumber(paymentLink.getAccountNumber())
                .accountName(paymentLink.getAccountName())
                .bin(paymentLink.getBin())
                .qrCode(paymentLink.getQrCode())
                .amount(paymentLink.getAmount())
                .build();
    }

    @Override
    public WebhookData verifyWebhook(Object body) throws Exception {
        return payOS.webhooks().verify(body);
    }

    @Override
    public PaymentLink getPaymentDetails(Order order) throws Exception {
        return payOS.paymentRequests().get(Long.parseLong(order.getTransactionId()));
    }

    @Override
    public boolean checkPaymentStatus(Order order) throws Exception {
        PaymentLink paymentLink = getPaymentDetails(order);
        String status = paymentLink.getStatus() != null ? paymentLink.getStatus().toString() : "";
        boolean isPaid = "PAID".equals(status);

        if (isPaid) {
            System.out.println("PayOS polling: Order " + order.getId() + " is PAID.");
        } else if (!"PENDING".equals(status)) {
            System.out.println("PayOS polling: Order " + order.getId() + " status is " + status);
        }

        return isPaid;
    }

    @Override
    public String getGatewayName() {
        return "PAYOS";
    }
}
