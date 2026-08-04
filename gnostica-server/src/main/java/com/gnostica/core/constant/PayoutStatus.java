package com.gnostica.core.constant;

public final class PayoutStatus {
    public static final int PENDING = 1;
    public static final int PROCESSING = 2;
    public static final int COMPLETED = 3;
    public static final int FAILED = 4;
    public static final int REJECTED = 5;

    private PayoutStatus() {
    }
}
