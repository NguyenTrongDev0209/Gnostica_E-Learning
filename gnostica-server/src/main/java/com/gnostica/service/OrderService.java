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

import java.util.ArrayList;
import com.gnostica.model.Account;
import com.gnostica.model.Course;
import com.gnostica.model.Order;
import com.gnostica.model.OrderDetail;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.repository.OrderDetailRepository;
import com.gnostica.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final PayOS payOS;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final PaymentService paymentService;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        final String productName = requestBody.getProductName();
        String description = requestBody.getDescription();
        if (description != null && description.length() > 25) {
            description = description.substring(0, 25);
        }
        final String returnUrl = requestBody.getReturnUrl();
        final String cancelUrl = requestBody.getCancelUrl();
        final long price = requestBody.getPrice();

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName();

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found for email: " + email));

        Course course = courseRepository.findById(requestBody.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found for ID: " + requestBody.getCourseId()));

        long orderCode = System.currentTimeMillis();

        Order order = new Order();
        order.setAccount(account);
        order.setTotalPrice((double) price);
        order.setStatus(0); // 0: PENDING
        order.setTransactionId(String.valueOf(orderCode));
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setCourse(course);
        detail.setPrice(course.getPrice());
        detail.setDiscount(0); // Optional: add discount logic
        orderDetailRepository.save(detail);

        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);
        order.setDetails(details);

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
        PaymentLink paymentLink = payOS.paymentRequests().get(orderId);
        if (paymentLink != null) {
            paymentService.syncPayment(paymentLink);
        }
        return paymentLink;
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
