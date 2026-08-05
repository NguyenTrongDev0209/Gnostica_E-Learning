package com.gnostica.modules.checkout.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Locale;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.Arrays;

public final class VNPaySigner {
    private static final String HMAC_SHA_512 = "HmacSHA512";

    private VNPaySigner() {}

    public static String buildPaymentUrl(String baseUrl, Map<String, String> parameters, String secret) {
        String query = buildSortedQuery(parameters);
        return baseUrl + "?" + query + "&vnp_SecureHash=" + hmacSha512(secret, query);
    }

    public static String buildSortedQuery(Map<String, String> parameters) {
        return new TreeMap<>(parameters).entrySet().stream()
                .filter(entry -> entry.getKey() != null && entry.getKey().startsWith("vnp_"))
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()))
                .filter(entry -> !"vnp_SecureHashType".equals(entry.getKey()))
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    /**
     * Keeps VNPay's original percent-encoding intact. Servlet containers decode
     * query parameters before exposing them as a Map, which can otherwise change
     * '+'/%20 or percent-encoded values and produce a different checksum.
     */
    public static String buildSortedRawQuery(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return "";
        }
        return Arrays.stream(rawQuery.split("&"))
                .filter(part -> !part.isBlank())
                .filter(part -> {
                    String key = part.contains("=") ? part.substring(0, part.indexOf('=')) : part;
                    return key.startsWith("vnp_")
                            && !"vnp_SecureHash".equals(key)
                            && !"vnp_SecureHashType".equals(key);
                })
                .filter(part -> part.contains("=") && part.indexOf('=') < part.length() - 1)
                .sorted((left, right) -> rawKey(left).compareTo(rawKey(right)))
                .collect(Collectors.joining("&"));
    }

    public static String buildSortedPlainQuery(Map<String, String> parameters) {
        return new TreeMap<>(parameters).entrySet().stream()
                .filter(entry -> entry.getKey() != null && entry.getKey().startsWith("vnp_"))
                .filter(entry -> !"vnp_SecureHash".equals(entry.getKey()))
                .filter(entry -> !"vnp_SecureHashType".equals(entry.getKey()))
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining("&"));
    }

    private static String rawKey(String part) {
        int separator = part.indexOf('=');
        return separator < 0 ? part : part.substring(0, separator);
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
        String normalizedExpected = expected.trim().toLowerCase(Locale.ROOT);
        String normalizedActual = actual.trim().toLowerCase(Locale.ROOT);
        return MessageDigest.isEqual(
                normalizedExpected.getBytes(StandardCharsets.US_ASCII),
                normalizedActual.getBytes(StandardCharsets.US_ASCII));
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }
}

