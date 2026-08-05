package com.gnostica.modules.checkout.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.integration.service.MailService;
import com.gnostica.modules.checkout.util.OrderPriceCalculator;
import com.gnostica.modules.checkout.dto.response.PaymentDetails;
import com.gnostica.modules.checkout.dto.response.PaymentLinkResponse;
import com.gnostica.modules.checkout.dto.response.PaymentWebhookData;
import com.gnostica.modules.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayosService {

    private static final int PAYOS_DESCRIPTION_MAX_LENGTH = 25;
    private static final String KEY_PREFIX = "payment:payos:pending:";
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(5);

    private final PayOS payOS;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    private final MailService mailService;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    
    @Lazy
    private final PaymentService paymentService;

    @Value("${app.public-url}")
    private String publicUrl;

    // === Payment Link ===
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception {
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);

        List<PaymentLinkItem> items = details.stream().map(d -> PaymentLinkItem.builder()
                .name(d.getCourse().getTitle())
                .quantity(1)
                .price(OrderPriceCalculator.amountPaidForDetail(order, d, details).longValueExact())
                .build()).collect(Collectors.toList());

        String description = limitDescription("DH " + order.getOrderCode());

        CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                .orderCode(order.getOrderCode())
                .amount(order.getTotalPrice().longValueExact())
                .description(description)
                .items(items)
                .returnUrl(returnUrl != null && !returnUrl.isEmpty() ? returnUrl : publicUrl + "/payment/success")
                .cancelUrl(cancelUrl != null && !cancelUrl.isEmpty() ? cancelUrl : publicUrl + "/payment/cancel")
                .build();

        CreatePaymentLinkResponse paymentLink = payOS.paymentRequests().create(paymentData);

        PaymentLinkResponse response = PaymentLinkResponse.builder()
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
                
        long expiresAt = System.currentTimeMillis() + 5 * 60 * 1000L;
        response.setExpiresAt(expiresAt);
        storePendingLink(order.getAccount().getId(), order.getDetails().get(0).getCourse().getId(), response);
        
        return response;
    }

    public void cancelPayment(Order order, String reason) throws Exception {
        payOS.paymentRequests().cancel(order.getOrderCode(), reason);
    }

    // === Webhook ===
    public PaymentWebhookData verifyWebhook(Object body) throws Exception {
        WebhookData data = payOS.webhooks().verify(body);
        
        // PayOS webhook "code" is "00" ONLY for a successful payment. Any other
        // value (PROCESSING, CANCELLED, error...) must NOT be treated as PAID,
        // otherwise an unverified/cancelled transaction would grant enrollment.
        boolean paid = "00".equals(data.getCode());
        
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("accountNumber", data.getAccountNumber());
        payload.put("senderBankCode", data.getCounterAccountBankId());
        payload.put("senderAccountNumber", data.getCounterAccountNumber());
        payload.put("bankCode", data.getCounterAccountBankId());
        payload.put("description", data.getDescription());
        payload.put("payosCode", data.getCode());
        payload.put("payosDesc", data.getDesc());
        
        return PaymentWebhookData.builder()
                .orderCode(data.getOrderCode())
                .transactionCode(data.getPaymentLinkId())
                .amount(data.getAmount())
                .status(paid ? "PAID" : "FAILED")
                .gateway("PAYOS")
                .payload(payload)
                .build();
    }

    @Transactional
    public void handleWebhook(PaymentWebhookData data) {
        if (data == null || data.getOrderCode() == null) {
            throw new IllegalArgumentException("Missing order code in PayOS webhook");
        }
        if (!"PAID".equals(data.getStatus())) {
            throw new IllegalArgumentException("PayOS webhook does not confirm a successful payment");
        }
        if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
            throw new IllegalArgumentException("Missing PayOS transaction code");
        }

        Long orderCode = data.getOrderCode();
        log.info("Webhook triggered for orderCode: {}", orderCode);

        Order order = orderRepository.findByOrderCodeForUpdate(orderCode).orElse(null);

        if (order == null) {
            log.warn("Ignoring PayOS webhook for unknown orderCode: {}", orderCode);
            return;
        }
        if (!"PAYOS".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new IllegalArgumentException("Order does not use PayOS");
        }

        if (data.getAmount() == null || order.getTotalPrice().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
            throw new IllegalArgumentException("Payment amount does not match order total");
        }
        
        if (order.getStatus() == OrderStatus.PENDING) {
            paymentService.processSuccessfulOrder(order);
            paymentService.saveTransaction(data, order);
            log.info("Payment processed successfully for order: {}", order.getId());
        } else if (order.getStatus() == OrderStatus.CANCELLED && "PAID".equals(data.getStatus())) {
            boolean alreadyRecorded = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                    "PAYOS", data.getTransactionCode());
            paymentService.saveTransaction(data, order);
            if (alreadyRecorded) {
                log.info("Ignoring duplicate late PayOS webhook for order {}", order.getId());
                return;
            }
            walletService.addDeposit(order.getAccount(), BigDecimal.valueOf(data.getAmount()), data.getTransactionCode());
            try {
                mailService.sendEmail(
                    order.getAccount().getEmail(),
                    "Thông báo về khoản thanh toán cho đơn hàng đã hết hạn",
                    "Chào bạn,\n\nHệ thống đã nhận được số tiền " + data.getAmount() + " VND từ bạn. Tuy nhiên đơn hàng " + data.getOrderCode() + " của bạn đã hết hạn trước khi giao dịch được xác nhận. Chúng tôi đã tự động cộng số tiền này vào Ví Gnostica của bạn. Bạn có thể sử dụng số dư này để thanh toán lại hoặc mua các khóa học khác.\n\nTrân trọng,\nĐội ngũ Gnostica"
                );
            } catch (Exception e) {
                log.error("Failed to send overdue payment email to {}: {}", order.getAccount().getEmail(), e.getMessage());
            }
            log.info("Overdue payment processed as wallet deposit for order: {}", order.getId());
        }
    }

    // === Query ===
    public PaymentDetails getPaymentDetails(Order order) throws Exception {
        PaymentLink link = payOS.paymentRequests().get(order.getOrderCode());
        
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        if (link.getTransactions() != null && !link.getTransactions().isEmpty()) {
            Object lastTx = link.getTransactions().get(link.getTransactions().size() - 1);
            payload.put("senderAccountNumber", readString(lastTx, "getCounterAccountNumber"));
            payload.put("senderBankCode", readString(lastTx, "getCounterAccountBankId"));
            payload.put("accountNumber", readString(lastTx, "getAccountNumber"));
        }
        
        return PaymentDetails.builder()
                .transactionCode(link.getId())
                .amount(link.getAmountPaid())
                .status(link.getStatus() != null ? link.getStatus().toString() : "")
                .gateway("PAYOS")
                .transactions(link.getTransactions())
                .payload(payload)
                .build();
    }

    public boolean checkPaymentStatus(Order order) throws Exception {
        PaymentDetails paymentLink = getPaymentDetails(order);
        String status = paymentLink.getStatus() != null ? paymentLink.getStatus() : "";
        boolean isPaid = "PAID".equals(status);

        if (isPaid) {
            log.info("PayOS polling: Order " + order.getId() + " is PAID.");
        } else if (!"PENDING".equals(status)) {
            log.info("PayOS polling: Order " + order.getId() + " status is " + status);
        }

        return isPaid;
    }

    // === Cache ===
    public void storePendingLink(Object accountId, Object courseId, PaymentLinkResponse paymentLink) {
        try {
            Duration ttl = ttlFor(paymentLink.getExpiresAt());
            if (ttl.isZero() || ttl.isNegative()) {
                return;
            }
            redisTemplate.opsForValue().set(cacheKey(accountId, courseId), objectMapper.writeValueAsString(paymentLink), ttl);
        } catch (Exception exception) {
            log.warn("Unable to cache pending PayOS link", exception);
        }
    }

    public Optional<PaymentLinkResponse> findPendingLink(Object accountId, Object courseId) {
        try {
            String value = redisTemplate.opsForValue().get(cacheKey(accountId, courseId));
            if (value == null || value.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(objectMapper.readValue(value, PaymentLinkResponse.class));
        } catch (Exception exception) {
            log.warn("Unable to read pending PayOS link from cache", exception);
            return Optional.empty();
        }
    }

    public void clearPendingLink(Object accountId, Object courseId) {
        try {
            redisTemplate.delete(cacheKey(accountId, courseId));
        } catch (Exception exception) {
            log.warn("Unable to clear pending PayOS link from cache", exception);
        }
    }

    // === Helpers ===
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
    
    private Duration ttlFor(Long expiresAt) {
        if (expiresAt == null) {
            return DEFAULT_TTL;
        }
        return Duration.ofMillis(expiresAt - System.currentTimeMillis());
    }

    private String cacheKey(Object accountId, Object courseId) {
        return KEY_PREFIX + accountId + ":course:" + courseId;
    }
}

