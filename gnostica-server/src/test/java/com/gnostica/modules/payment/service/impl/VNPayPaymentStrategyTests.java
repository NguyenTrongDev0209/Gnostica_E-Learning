package com.gnostica.modules.payment.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.config.VNPayProperties;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.core.model.Order;
import com.gnostica.modules.payment.util.VNPaySigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import java.math.BigDecimal;

class VNPayPaymentStrategyTests {
    private static final String SECRET = "test-secret";
    private VNPayPaymentStrategy strategy;

    @BeforeEach
    void setUp() {
        VNPayProperties properties = new VNPayProperties();
        properties.setTmnCode("TESTCODE");
        properties.setHashSecret(SECRET);
        strategy = new VNPayPaymentStrategy(properties, new ObjectMapper());
    }

    @Test
    void verifiesSuccessfulCallback() {
        Map<String, String> parameters = signedCallback();

        PaymentWebhookData result = strategy.verifyWebhook(parameters);

        assertThat(result.getOrderCode()).isEqualTo(123456L);
        assertThat(result.getAmount()).isEqualTo(50_000L);
        assertThat(result.getTransactionCode()).isEqualTo("987654");
        assertThat(result.getStatus()).isEqualTo("PAID");
        assertThat(result.getGateway()).isEqualTo("VNPAY");
        assertThat(result.getRawCallback()).doesNotContainKey("vnp_SecureHash");
    }

    @Test
    void rejectsCallbackModifiedAfterSigning() {
        Map<String, String> parameters = signedCallback();
        parameters.put("vnp_Amount", "9000000");

        assertThatThrownBy(() -> strategy.verifyWebhook(parameters))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("signature");
    }

    @Test
    void mapsNonSuccessfulTransactionWithoutMarkingItPaid() {
        Map<String, String> parameters = signedCallback("24", "02");

        assertThat(strategy.verifyWebhook(parameters).getStatus()).isEqualTo("FAILED");
    }

    @Test
    void createsSignedSandboxPaymentUrl() {
        Order order = Order.builder()
                .orderCode(123456L)
                .totalPrice(BigDecimal.valueOf(50_000L))
                .build();

        PaymentLinkResponse result = strategy.createPaymentLink(order, null, null);

        assertThat(result.getCheckoutUrl()).startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?");
        assertThat(result.getCheckoutUrl()).contains("vnp_Amount=5000000");
        assertThat(result.getCheckoutUrl()).contains("vnp_TxnRef=123456");
        assertThat(result.getCheckoutUrl()).contains("vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fpayment%2Fvnpay%2Freturn");

        String query = result.getCheckoutUrl().substring(result.getCheckoutUrl().indexOf('?') + 1);
        int signatureSeparator = query.lastIndexOf("&vnp_SecureHash=");
        String signedQuery = query.substring(0, signatureSeparator);
        String signature = query.substring(signatureSeparator + "&vnp_SecureHash=".length());
        assertThat(VNPaySigner.secureEquals(VNPaySigner.hmacSha512(SECRET, signedQuery), signature)).isTrue();
    }

    @Test
    void rejectsPaymentBelowVNPayMinimum() {
        Order order = Order.builder()
                .orderCode(123456L)
                .totalPrice(BigDecimal.valueOf(4_999L))
                .build();

        assertThatThrownBy(() -> strategy.createPaymentLink(order, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("5,000");
    }

    private Map<String, String> signedCallback() {
        return signedCallback("00", "00");
    }

    private Map<String, String> signedCallback(String responseCode, String transactionStatus) {
        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_Amount", "5000000");
        parameters.put("vnp_BankCode", "NCB");
        parameters.put("vnp_ResponseCode", responseCode);
        parameters.put("vnp_TmnCode", "TESTCODE");
        parameters.put("vnp_TransactionNo", "987654");
        parameters.put("vnp_TransactionStatus", transactionStatus);
        parameters.put("vnp_TxnRef", "123456");
        parameters.put("vnp_SecureHash", VNPaySigner.hmacSha512(SECRET, VNPaySigner.buildSortedQuery(parameters)));
        return parameters;
    }
}
