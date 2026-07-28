package com.gnostica.core.constant;

/** Coupon discount calculation types persisted in coupons.discount_type. */
public final class CouponDiscountType {

    public static final int PERCENTAGE = 1;
    public static final int FIXED_AMOUNT = 2;

    private CouponDiscountType() {
    }

    public static boolean isSupported(Integer value) {
        return value != null && (value == PERCENTAGE || value == FIXED_AMOUNT);
    }
}
