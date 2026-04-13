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

@Service
@RequiredArgsConstructor
public class OrderService {
    private final PayOS payOS;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        final String productName = requestBody.getProductName();
        final String description = requestBody.getDescription();
        final String returnUrl = requestBody.getReturnUrl();
        final String cancelUrl = requestBody.getCancelUrl();
        final long price = requestBody.getPrice();

        Account account = accountRepository.findById(requestBody.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        List<Course> courses = courseRepository.findAllById(requestBody.getCourseIds());
        if (courses.isEmpty()) {
            throw new RuntimeException("No courses found for the given IDs");
        }

        Order order = new Order();
        order.setAccount(account);
        order.setTotalPrice((double) price);
        order.setStatus(0); // 0: PENDING
        order.setCreatedAt(LocalDateTime.now());
        order = orderRepository.save(order);

        List<OrderDetail> details = new ArrayList<>();
        for (Course course : courses) {
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setCourse(course);
            detail.setPrice(course.getPrice());
            detail.setDiscount(0); // Optional: add discount logic
            details.add(orderDetailRepository.save(detail));
        }
        order.setDetails(details);

        PaymentLinkItem item = PaymentLinkItem.builder()
                .name(productName)
                .quantity(1)
                .price(price)
                .build();

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode((long) order.getId())
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
