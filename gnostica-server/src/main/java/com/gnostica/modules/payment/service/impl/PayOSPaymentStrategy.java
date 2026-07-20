package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.response.PaymentDetails;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.modules.payment.service.PaymentStrategy;
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
public class PayOSPaymentStrategy implements PaymentStrategy {

    private static final int PAYOS_DESCRIPTION_MAX_LENGTH = 25;

    private final PayOS payOS;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception {
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);

        List<PaymentLinkItem> items = details.stream().map(d -> PaymentLinkItem.builder()
                .name(d.getCourse().getTitle())
                .quantity(1)
                .price((long) d.getPrice().doubleValue())
                .build()).collect(Collectors.toList());

        String description = limitDescription("DH " + order.getOrderCode());

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(order.getOrderCode())
                .amount((long) order.getTotalPrice().doubleValue())
                .description(description)
                .items(items)
                .returnUrl(returnUrl != null && !returnUrl.isEmpty() ? returnUrl : "http://localhost:5173/payment/success")
                .cancelUrl(cancelUrl != null && !cancelUrl.isEmpty() ? cancelUrl : "http://localhost:5173/payment/cancel")
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
    public PaymentWebhookData verifyWebhook(Object body) throws Exception {
        WebhookData data = payOS.webhooks().verify(body);
        return PaymentWebhookData.builder()
                .orderCode(data.getOrderCode())
                .transactionCode(data.getPaymentLinkId())
                .amount(data.getAmount())
                .status("PAID")
                .accountNumber(data.getAccountNumber())
                .senderBankCode(data.getCounterAccountBankId())
                .senderAccountNumber(data.getCounterAccountNumber())
                .gateway("PAYOS")
                .bankCode(data.getCounterAccountBankId())
                .build();
    }

    @Override
    public PaymentDetails getPaymentDetails(Order order) throws Exception {
        PaymentLink link = payOS.paymentRequests().get(order.getOrderCode());
        PaymentDetails.PaymentDetailsBuilder details = PaymentDetails.builder()
                .transactionCode(String.valueOf(link.getOrderCode()))
                .amount(link.getAmountPaid())
                .status(link.getStatus() != null ? link.getStatus().toString() : "")
                .gateway("PAYOS")
                .transactions(link.getTransactions());

        if (link.getTransactions() != null && !link.getTransactions().isEmpty()) {
            Object lastTx = link.getTransactions().get(link.getTransactions().size() - 1);
            details.senderAccountNumber(readString(lastTx, "getCounterAccountNumber"));
            details.senderBankCode(readString(lastTx, "getCounterAccountBankId"));
            details.accountNumber(readString(lastTx, "getAccountNumber"));
        }
        return details.build();
    }

    @Override
    public boolean checkPaymentStatus(Order order) throws Exception {
        PaymentDetails paymentLink = getPaymentDetails(order);
        String status = paymentLink.getStatus() != null ? paymentLink.getStatus() : "";
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

    private String readString(Object target, String methodName) {
        try {
            return (String) target.getClass().getMethod(methodName).invoke(target);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String limitDescription(String description) {
        if (description == null || description.length() <= PAYOS_DESCRIPTION_MAX_LENGTH) {
            return description;
        }
        return description.substring(0, PAYOS_DESCRIPTION_MAX_LENGTH);
    }
}
