package com.gnostica.modules.checkout.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.config.VNPayProperties;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.checkout.dto.response.PaymentDetails;
import com.gnostica.modules.checkout.dto.response.PaymentLinkResponse;
import com.gnostica.modules.checkout.dto.response.PaymentWebhookData;
import com.gnostica.modules.checkout.dto.response.VNPayIpnResponse;
import com.gnostica.modules.checkout.util.VNPaySigner;
import com.gnostica.modules.wallet.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnpayService {
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VNPayProperties properties;
    private final ObjectMapper objectMapper;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final WalletService walletService;
    
    @Lazy
    @Autowired
    private PaymentService paymentService;

    @Lazy
    @Autowired
    private com.gnostica.modules.checkout.service.GiftService giftService;

    // === Payment Link ===
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) {
        validateConfiguration();
        long amount = order.getTotalPrice().longValueExact();
        if (amount < 10_000) {
            throw new IllegalArgumentException("VNPay requires a minimum payment amount of 10,000 VND");
        }

        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
        LocalDateTime createdAt = order.getCreatedAt() != null ? order.getCreatedAt() : now;
        LocalDateTime expiresAt = createdAt.plusMinutes(properties.getExpireMinutes());
        if (!expiresAt.isAfter(now)) {
            throw new IllegalArgumentException("VNPay payment link has expired");
        }
        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_Version", properties.getVersion());
        parameters.put("vnp_Command", "pay");
        parameters.put("vnp_TmnCode", properties.getTmnCode());
        parameters.put("vnp_Amount", String.valueOf(Math.multiplyExact(amount, 100L)));
        parameters.put("vnp_CurrCode", "VND");
        parameters.put("vnp_TxnRef", String.valueOf(order.getOrderCode()));
        parameters.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        parameters.put("vnp_OrderType", "other");
        parameters.put("vnp_Locale", "vn");
        parameters.put("vnp_ReturnUrl", selectReturnUrl(returnUrl));
        parameters.put("vnp_IpAddr", resolveClientIp());
        parameters.put("vnp_CreateDate", createdAt.format(VNPAY_DATE));
        parameters.put("vnp_ExpireDate", expiresAt.format(VNPAY_DATE));

        String checkoutUrl = VNPaySigner.buildPaymentUrl(
                properties.getPaymentUrl(), parameters, properties.getHashSecret());
        return PaymentLinkResponse.builder()
                .checkoutUrl(checkoutUrl)
                .paymentLinkId(String.valueOf(order.getOrderCode()))
                .orderCode(order.getOrderCode())
                .status("PENDING")
                .description(parameters.get("vnp_OrderInfo"))
                .amount(amount)
                .expiresAt(expiresAt.atZone(VIETNAM_ZONE).toInstant().toEpochMilli())
                .build();
    }

    // === Webhook / IPN ===
    public PaymentWebhookData verifyWebhook(Object body) {
        validateConfiguration();
        if (!(body instanceof Map<?, ?> rawParameters)) {
            throw new IllegalArgumentException("Invalid VNPay callback payload");
        }

        Map<String, String> parameters = new TreeMap<>();
        rawParameters.forEach((key, value) -> {
            if (key != null && value != null) {
                parameters.put(String.valueOf(key), String.valueOf(value));
            }
        });
        String receivedSignature = parameters.remove("vnp_SecureHash");
        parameters.remove("vnp_SecureHashType");
        String expectedSignature = VNPaySigner.hmacSha512(
                properties.getHashSecret(), VNPaySigner.buildSortedQuery(parameters));
        String plainExpectedSignature = null;
        String rawExpectedSignature = null;
        boolean validSignature = VNPaySigner.secureEquals(expectedSignature, receivedSignature);
        if (!validSignature) {
            String plainSignedData = VNPaySigner.buildSortedPlainQuery(parameters);
            plainExpectedSignature = VNPaySigner.hmacSha512(properties.getHashSecret(), plainSignedData);
            validSignature = VNPaySigner.secureEquals(plainExpectedSignature, receivedSignature);
        }
        if (!validSignature
                && RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            String rawSignedData = VNPaySigner.buildSortedRawQuery(attributes.getRequest().getQueryString());
            if (!rawSignedData.isBlank()) {
                rawExpectedSignature = VNPaySigner.hmacSha512(properties.getHashSecret(), rawSignedData);
                validSignature = VNPaySigner.secureEquals(rawExpectedSignature, receivedSignature);
            }
        }
        if (!validSignature) {
            throw new IllegalArgumentException("Invalid VNPay callback signature [encoded="
                    + prefix(expectedSignature) + ", plain=" + prefix(plainExpectedSignature)
                    + ", raw=" + prefix(rawExpectedSignature) + ", received=" + prefix(receivedSignature) + "]");
        }
        if (!properties.getTmnCode().equals(parameters.get("vnp_TmnCode"))) {
            throw new IllegalArgumentException("Invalid VNPay merchant code");
        }

        Long orderCode;
        long rawAmount;
        try {
            orderCode = Long.valueOf(parameters.get("vnp_TxnRef"));
            rawAmount = Long.parseLong(parameters.get("vnp_Amount"));
        } catch (NumberFormatException | NullPointerException exception) {
            throw new IllegalArgumentException("Invalid VNPay order or amount", exception);
        }
        if (rawAmount < 0 || rawAmount % 100 != 0) {
            throw new IllegalArgumentException("Invalid VNPay amount precision");
        }

        boolean paid = "00".equals(parameters.get("vnp_ResponseCode"))
                && "00".equals(parameters.get("vnp_TransactionStatus"));
        LocalDateTime paidAt = parseVNPayDate(parameters.get("vnp_PayDate"));
        return PaymentWebhookData.builder()
                .orderCode(orderCode)
                .transactionCode(parameters.get("vnp_TransactionNo"))
                .amount(rawAmount / 100)
                .status(paid ? "PAID" : "FAILED")
                .gateway("VNPAY")
                .paidAt(paidAt)
                .payload(new LinkedHashMap<>(parameters))
                .build();
    }

    @Transactional
    public VNPayIpnResponse handleVNPayIpn(Map<String, String> parameters) {
        PaymentWebhookData data;
        try {
            data = verifyWebhook(parameters);
        } catch (IllegalArgumentException exception) {
            log.warn("Rejected VNPay IPN: {}", exception.getMessage());
            if (exception.getMessage() != null
                    && (exception.getMessage().contains("signature") || exception.getMessage().contains("merchant"))) {
                return VNPayIpnResponse.invalidSignature();
            }
            return VNPayIpnResponse.invalidRequest();
        } catch (Exception exception) {
            log.error("Unable to verify VNPay IPN", exception);
            return VNPayIpnResponse.invalidRequest();
        }

        Order order = orderRepository.findByOrderCodeForUpdate(data.getOrderCode()).orElse(null);
        if (order == null || !"VNPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            return VNPayIpnResponse.orderNotFound();
        }
        if (order.getStatus() == OrderStatus.PAID) {
            return VNPayIpnResponse.alreadyProcessed();
        }
        if (data.getAmount() == null
                || order.getTotalPrice().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
            return VNPayIpnResponse.invalidAmount();
        }
        if ("PAID".equals(data.getStatus()) && order.getStatus() == OrderStatus.CANCELLED) {
            if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
                return VNPayIpnResponse.invalidRequest();
            }
            boolean alreadyRecorded = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                    "VNPAY", data.getTransactionCode());
            paymentService.saveTransaction(data, order);
            if (!alreadyRecorded) {
                walletService.addDeposit(order.getAccount(), BigDecimal.valueOf(data.getAmount()), data.getTransactionCode());
            }
            log.info("Late VNPay payment credited to wallet for expired order {}", order.getId());
            return VNPayIpnResponse.success();
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            return VNPayIpnResponse.alreadyProcessed();
        }
        if (!"PAID".equals(data.getStatus())) {
            log.info("VNPay reported non-successful transaction for order {}", order.getId());
            if (hasGatewayTransactionCode(data.getTransactionCode())) {
                paymentService.saveTransaction(data, order);
            }
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                paymentService.releaseCouponReservation(order);
                giftService.voidGiftsForCancelledOrder(order);
            }
            return VNPayIpnResponse.success();
        }
        if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
            return VNPayIpnResponse.invalidRequest();
        }

        paymentService.processSuccessfulOrder(order);
        paymentService.saveTransaction(data, order);
        log.info("VNPay payment processed successfully for order {}", order.getId());
        return VNPayIpnResponse.success();
    }

    // === Query ===
    public boolean checkPaymentStatus(Order order) throws Exception {
        return "PAID".equals(getPaymentDetails(order).getStatus());
    }

    public PaymentDetails getPaymentDetails(Order order) throws Exception {
        validateConfiguration();
        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
        String requestId = UUID.randomUUID().toString().replace("-", "");
        String transactionDate = order.getCreatedAt() != null
                ? order.getCreatedAt().format(VNPAY_DATE)
                : now.format(VNPAY_DATE);
        String createDate = now.format(VNPAY_DATE);
        String txnRef = String.valueOf(order.getOrderCode());
        String orderInfo = "Truy van don hang " + txnRef;
        String ipAddress = resolveClientIp();
        String command = "querydr";

        String signedData = String.join("|", requestId, properties.getVersion(), command,
                properties.getTmnCode(), txnRef, transactionDate, createDate, ipAddress, orderInfo);

        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("vnp_RequestId", requestId);
        payload.put("vnp_Version", properties.getVersion());
        payload.put("vnp_Command", command);
        payload.put("vnp_TmnCode", properties.getTmnCode());
        payload.put("vnp_TxnRef", txnRef);
        payload.put("vnp_OrderInfo", orderInfo);
        payload.put("vnp_TransactionDate", transactionDate);
        payload.put("vnp_CreateDate", createDate);
        payload.put("vnp_IpAddr", ipAddress);
        payload.put("vnp_SecureHash", VNPaySigner.hmacSha512(properties.getHashSecret(), signedData));

        HttpRequest request = HttpRequest.newBuilder(URI.create(properties.getQueryUrl()))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload), StandardCharsets.UTF_8))
                .build();
        HttpResponse<String> response = createHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IllegalStateException("VNPay query failed with HTTP " + response.statusCode());
        }

        JsonNode result = objectMapper.readTree(response.body());
        verifyQueryResponse(result);
        String responseCode = result.path("vnp_ResponseCode").asText();
        String transactionStatus = result.path("vnp_TransactionStatus").asText();
        
        String status;
        if (!"00".equals(responseCode)) {
            status = "UNAVAILABLE";
        } else if ("00".equals(transactionStatus)) {
            status = "PAID";
        } else if ("01".equals(transactionStatus) || transactionStatus.isBlank()) {
            status = "PENDING";
        } else {
            status = "FAILED";
        }
        long amount = result.path("vnp_Amount").asLong(0L) / 100L;
        java.util.Map<String, Object> detailsPayload = new java.util.HashMap<>();
        detailsPayload.put("senderBankCode", result.path("vnp_BankCode").asText(null));
        detailsPayload.put("bankCode", result.path("vnp_BankCode").asText(null));
        detailsPayload.put("responseCode", responseCode);
        detailsPayload.put("transactionStatus", transactionStatus);
        
        return PaymentDetails.builder()
                .transactionCode(result.path("vnp_TransactionNo").asText(txnRef))
                .amount(amount)
                .status(status)
                .gateway("VNPAY")
                .paidAt(parseVNPayDate(result.path("vnp_PayDate").asText(null)))
                .payload(detailsPayload)
                .build();
    }

    // === Helpers ===
    private void validateConfiguration() {
        if (properties.getTmnCode() == null || properties.getTmnCode().isBlank()
                || properties.getHashSecret() == null || properties.getHashSecret().isBlank()) {
            throw new IllegalStateException("VNPay credentials are not configured");
        }
    }

    private void verifyQueryResponse(JsonNode result) {
        String signedData = String.join("|",
                text(result, "vnp_ResponseId"),
                text(result, "vnp_Command"),
                text(result, "vnp_ResponseCode"),
                text(result, "vnp_Message"),
                text(result, "vnp_TmnCode"),
                text(result, "vnp_TxnRef"),
                text(result, "vnp_Amount"),
                text(result, "vnp_BankCode"),
                text(result, "vnp_PayDate"),
                text(result, "vnp_TransactionNo"),
                text(result, "vnp_TransactionType"),
                text(result, "vnp_TransactionStatus"),
                text(result, "vnp_OrderInfo"),
                text(result, "vnp_PromotionCode"),
                text(result, "vnp_PromotionAmount"));
        String expected = VNPaySigner.hmacSha512(properties.getHashSecret(), signedData);
        if (!VNPaySigner.secureEquals(expected, text(result, "vnp_SecureHash"))) {
            throw new IllegalArgumentException("Invalid VNPay query response signature");
        }
    }

    private String text(JsonNode node, String field) {
        return node.path(field).asText("");
    }

    private LocalDateTime parseVNPayDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(value, VNPAY_DATE);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String prefix(String value) {
        return value == null ? "none" : value.substring(0, Math.min(12, value.length()));
    }

    private HttpClient createHttpClient() {
        if (!System.getProperty("os.name", "").toLowerCase().contains("windows")) {
            return HttpClient.newHttpClient();
        }
        try {
            KeyStore windowsRoots = KeyStore.getInstance("Windows-ROOT");
            windowsRoots.load(null, null);
            TrustManagerFactory trustManagers = TrustManagerFactory.getInstance(
                    TrustManagerFactory.getDefaultAlgorithm());
            trustManagers.init(windowsRoots);
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustManagers.getTrustManagers(), null);
            return HttpClient.newBuilder().sslContext(sslContext).build();
        } catch (Exception ignored) {
            return HttpClient.newHttpClient();
        }
    }

    private String selectReturnUrl(String requestedReturnUrl) {
        if (properties.getReturnUrl() != null && !properties.getReturnUrl().isBlank()) {
            return properties.getReturnUrl();
        }
        if (requestedReturnUrl == null || requestedReturnUrl.isBlank()) {
            throw new IllegalArgumentException("VNPay return URL is not configured");
        }
        return requestedReturnUrl;
    }

    private String resolveClientIp() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            HttpServletRequest request = attributes.getRequest();
            String forwardedFor = request.getHeader("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isBlank()) {
                return forwardedFor.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
        return "127.0.0.1";
    }

    private boolean hasGatewayTransactionCode(String transactionCode) {
        return transactionCode != null && !transactionCode.isBlank() && !"0".equals(transactionCode.trim());
    }
}

