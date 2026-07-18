package com.gnostica.modules.payment.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

public final class VNPaySigner {
    private static final String HMAC_SHA_512 = "HmacSHA512";

    private VNPaySigner() {}

    public static String buildPaymentUrl(String baseUrl, Map<String, String> parameters, String secret) {
        String query = buildSortedQuery(parameters);
        return baseUrl + "?" + query + "&vnp_SecureHash=" + hmacSha512(secret, query);
    }

    public static String buildSortedQuery(Map<String, String> parameters) {
        return new TreeMap<>(parameters).entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    public static String hmacSha512(String secret, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA_512);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA_512));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                result.append(String.format("%02x", value & 0xff));
            }
            return result.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign VNPay payload", exception);
        }
    }

    public static boolean secureEquals(String expected, String actual) {
        if (expected == null || actual == null) {
            return false;
        }
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.US_ASCII),
                actual.getBytes(StandardCharsets.US_ASCII));
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }
}
