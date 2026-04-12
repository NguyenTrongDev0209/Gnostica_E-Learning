package com.gnostica.service;

import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.core.FileDownloadResponse;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.invoices.InvoicesInfo;
import vn.payos.model.webhooks.ConfirmWebhookResponse;

import com.gnostica.dto.CreatePaymentLinkRequestBody;
import com.gnostica.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import com.gnostica.model.Order;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final PayOS payOS;
    private final OrderRepository orderRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        final String productName = requestBody.getProductName();
        final String description = requestBody.getDescription();
        final String returnUrl = requestBody.getReturnUrl();
        final String cancelUrl = requestBody.getCancelUrl();
        final long price = requestBody.getPrice();
        long orderCode = System.currentTimeMillis() / 1000;

        PaymentLinkItem item = PaymentLinkItem.builder()
                .name(productName)
                .quantity(1)
                .price(price)
                .build();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .description(description)
                .amount(price)
                .item(item)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();

        return payOS.paymentRequests().create(paymentData);
    }

    public PaymentLink getOrderById(long orderId) throws Exception {
        return payOS.paymentRequests().get(orderId);
    }

    public PaymentLink cancelOrder(long orderId, String cancellationReason) throws Exception {
        return payOS.paymentRequests().cancel(orderId, cancellationReason);
    }

    public ConfirmWebhookResponse confirmWebhook(String webhookUrl) throws Exception {
        return payOS.webhooks().confirm(webhookUrl);
    }

    public InvoicesInfo retrieveInvoices(long orderId) throws Exception {
        return payOS.paymentRequests().invoices().get(orderId);
    }

    public FileDownloadResponse downloadInvoice(String invoiceId, long orderId) throws Exception {
        return payOS.paymentRequests().invoices().download(invoiceId, orderId);
    }
}
