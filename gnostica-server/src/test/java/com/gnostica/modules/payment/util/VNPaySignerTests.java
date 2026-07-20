package com.gnostica.modules.payment.util;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VNPaySignerTests {

    @Test
    void secureEqualsAcceptsUppercaseHexFromGateway() {
        String lowercase = VNPaySigner.hmacSha512("secret", "payload");

        assertThat(VNPaySigner.secureEquals(lowercase, lowercase.toUpperCase())).isTrue();
    }
    @Test
    void buildsSortedAndEncodedQuery() {
        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_TxnRef", "123");
        parameters.put("vnp_OrderInfo", "Thanh toan don hang 123");
        parameters.put("empty", "");

        assertThat(VNPaySigner.buildSortedQuery(parameters))
                .isEqualTo("vnp_OrderInfo=Thanh+toan+don+hang+123&vnp_TxnRef=123");
    }

    @Test
    void ignoresNonVnpFieldsWhenBuildingChecksum() {
        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("tracking", "must-not-be-signed");
        parameters.put("vnp_TxnRef", "123");
        parameters.put("vnp_SecureHash", "signature");

        assertThat(VNPaySigner.buildSortedQuery(parameters)).isEqualTo("vnp_TxnRef=123");
    }

    @Test
    void preservesOriginalCallbackEncoding() {
        String raw = "vnp_TxnRef=123&vnp_SecureHash=abc&vnp_OrderInfo=Thanh%20toan+don+hang";

        assertThat(VNPaySigner.buildSortedRawQuery(raw))
                .isEqualTo("vnp_OrderInfo=Thanh%20toan+don+hang&vnp_TxnRef=123");
    }

    @Test
    void buildsDecodedCallbackVariantUsedByVnpayNodeSample() {
        Map<String, String> parameters = new LinkedHashMap<>();
        parameters.put("vnp_TxnRef", "123");
        parameters.put("vnp_OrderInfo", "Thanh toan don hang");

        assertThat(VNPaySigner.buildSortedPlainQuery(parameters))
                .isEqualTo("vnp_OrderInfo=Thanh toan don hang&vnp_TxnRef=123");
    }

    @Test
    void createsStableHmacSha512() {
        assertThat(VNPaySigner.hmacSha512("secret", "payload"))
                .isEqualTo("291ddaaa23cafa3aaae1c9755391f4bef35bbdbcb92739a5618a5c896f6520d2b0d28d2d2987dac97479e31214a51d96cfceafa28e46a4f961b63c46352a189e");
    }

    @Test
    void comparesSignaturesSafely() {
        assertThat(VNPaySigner.secureEquals("abc", "abc")).isTrue();
        assertThat(VNPaySigner.secureEquals("abc", "abd")).isFalse();
        assertThat(VNPaySigner.secureEquals(null, "abc")).isFalse();
    }
}
