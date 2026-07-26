package com.gnostica.core.constant;

/** Coupon lifecycle states persisted in coupons.status. */
public final class CouponStatus {

    public static final int INACTIVE = 0;
    public static final int ACTIVE = 1;
    public static final int EXPIRED = 2;

    private CouponStatus() {
    }

    public static boolean isSupported(Integer value) {
        return value != null && (value == INACTIVE || value == ACTIVE || value == EXPIRED);
    }
}
