package com.gnostica.core.util;

import java.security.SecureRandom;

public class RandomUtil {

    private static final String ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final String NUMERIC_CHARS = "0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Sinh mã giảm giá ngẫu nhiên chữ và số in hoa
     */
    public static String generateCouponCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHANUMERIC_CHARS.charAt(RANDOM.nextInt(ALPHANUMERIC_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Sinh mã tham chiếu đơn hàng chuẩn hóa (VD: ORD-A3F9B2L1)
     */
    public static String generateOrderReference() {
        return "ORD-" + generateCouponCode(8);
    }

    /**
     * Sinh mã xác thực OTP bằng số
     */
    public static String generateOtp(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(NUMERIC_CHARS.charAt(RANDOM.nextInt(NUMERIC_CHARS.length())));
        }
        return sb.toString();
    }
}
