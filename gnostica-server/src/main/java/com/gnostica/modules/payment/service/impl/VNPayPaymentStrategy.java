package com.gnostica.modules.payment.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.config.VNPayProperties;
import com.gnostica.core.model.Order;
import com.gnostica.modules.payment.dto.response.PaymentDetails;
import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.service.PaymentStrategy;
import com.gnostica.modules.payment.util.VNPaySigner;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.TreeMap;
import java.security.KeyStore;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManagerFactory;

@Service
@RequiredArgsConstructor
public class VNPayPaymentStrategy implements PaymentStrategy {
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VNPayProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) {
        validateConfiguration();
        long amount = order.getTotalPrice().longValueExact();
        if (amount < 10_000) {
            throw new IllegalArgumentException("VNPay requires a minimum payment amount of 10,000 VND");
        }

        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
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
        parameters.put("vnp_CreateDate", now.format(VNPAY_DATE));
        parameters.put("vnp_ExpireDate", now.plusMinutes(properties.getExpireMinutes()).format(VNPAY_DATE));

        String checkoutUrl = VNPaySigner.buildPaymentUrl(
                properties.getPaymentUrl(), parameters, properties.getHashSecret());
        return PaymentLinkResponse.builder()
                .checkoutUrl(checkoutUrl)
                .paymentLinkId(String.valueOf(order.getOrderCode()))
                .orderCode(order.getOrderCode())
                .status("PENDING")
                .description(parameters.get("vnp_OrderInfo"))
                .amount(amount)
                .build();
    }

    @Override
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
                .senderBankCode(parameters.get("vnp_BankCode"))
                .gateway("VNPAY")
                .bankCode(parameters.get("vnp_BankCode"))
                .cardType(parameters.get("vnp_CardType"))
                .responseCode(parameters.get("vnp_ResponseCode"))
                .transactionStatus(parameters.get("vnp_TransactionStatus"))
                .paidAt(paidAt)
                .rawCallback(new LinkedHashMap<>(parameters))
                .build();
    }

    @Override
    public boolean checkPaymentStatus(Order order) throws Exception {
        return "PAID".equals(getPaymentDetails(order).getStatus());
    }

    @Override
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
        String status = "00".equals(responseCode) && "00".equals(transactionStatus) ? "PAID" : "PENDING";
        long amount = result.path("vnp_Amount").asLong(0L) / 100L;
        return PaymentDetails.builder()
                .transactionCode(result.path("vnp_TransactionNo").asText(txnRef))
                .amount(amount)
                .status(status)
                .senderBankCode(result.path("vnp_BankCode").asText(null))
                .gateway("VNPAY")
                .bankCode(result.path("vnp_BankCode").asText(null))
                .responseCode(responseCode)
                .transactionStatus(transactionStatus)
                .paidAt(parseVNPayDate(result.path("vnp_PayDate").asText(null)))
                .build();
    }

    @Override
    public String getGatewayName() {
        return "VNPAY";
    }

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
}
