package com.gnostica.modules.checkout.util;

import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Single source of truth for splitting one order-detail's revenue between the
 * instructor and the platform. The rules MUST stay in sync with
 * {@link com.gnostica.core.listener.WalletListener} because the wallet ledger
 * (the actual money) is written there:
 *
 * <ul>
 *   <li>Coupon sponsored by the platform (created by an ADMIN) is never deducted
 *       from the instructor's agreed share → instructor = gross × ratio.</li>
 *   <li>Coupon sponsored by the instructor reduces the collected amount, so the
 *       platform fee is computed on the net sale → instructor = net × ratio.</li>
 * </ul>
 *
 * All amounts come from the order snapshot (never the course's current price).
 */
public final class OrderRevenueCalculator {

    private OrderRevenueCalculator() {
    }

    /** True when the coupon was created by an ADMIN and is therefore platform-sponsored. */
    public static boolean isPlatformSponsoredCoupon(Order order) {
        return order != null
                && order.getCoupon() != null
                && order.getCoupon().getAccount() != null
                && order.getCoupon().getAccount().getRole() != null
                && "ADMIN".equalsIgnoreCase(order.getCoupon().getAccount().getRole().getName());
    }

    /**
     * @param instructorRatio instructor commission percentage (e.g. 90)
     * @param platformRatio   platform commission percentage (e.g. 10)
     */
    public static Split split(Order order, OrderDetail detail, List<OrderDetail> details,
                              BigDecimal instructorRatio, BigDecimal platformRatio) {
        BigDecimal grossAmount = OrderPriceCalculator.amountAfterCourseDiscount(detail)
                .setScale(6, RoundingMode.HALF_UP);
        BigDecimal couponAllocation = OrderPriceCalculator.couponAllocation(order, detail, details)
                .setScale(6, RoundingMode.HALF_UP);
        BigDecimal netSaleAmount = grossAmount.subtract(couponAllocation).max(BigDecimal.ZERO)
                .setScale(6, RoundingMode.HALF_UP);
        BigDecimal courseDiscountAmount = detail.getPrice().subtract(grossAmount)
                .setScale(6, RoundingMode.HALF_UP);
        BigDecimal discountAmount = courseDiscountAmount.add(couponAllocation)
                .setScale(6, RoundingMode.HALF_UP);

        BigDecimal instructorAmount;
        BigDecimal platformAmount;
        if (isPlatformSponsoredCoupon(order)) {
            // Platform campaigns never reduce the instructor's agreed share.
            instructorAmount = grossAmount.multiply(instructorRatio)
                    .divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
            platformAmount = netSaleAmount.subtract(instructorAmount).setScale(6, RoundingMode.HALF_UP);
        } else {
            // Instructor coupons: the platform fee is based on the amount actually
            // collected (net sale), so the discount is shared proportionally and the
            // instructor never ends up with a negative earning.
            platformAmount = netSaleAmount.multiply(platformRatio)
                    .divide(new BigDecimal("100"), 6, RoundingMode.HALF_UP);
            instructorAmount = netSaleAmount.subtract(platformAmount).setScale(6, RoundingMode.HALF_UP);
        }

        return new Split(grossAmount, couponAllocation, netSaleAmount, courseDiscountAmount,
                discountAmount, instructorAmount, platformAmount);
    }

    /** Immutable result of a revenue split for one order detail. */
    public static final class Split {
        public final BigDecimal grossAmount;
        public final BigDecimal couponAllocation;
        public final BigDecimal netSaleAmount;
        public final BigDecimal courseDiscountAmount;
        public final BigDecimal discountAmount;
        public final BigDecimal instructorAmount;
        public final BigDecimal platformAmount;

        public Split(BigDecimal grossAmount, BigDecimal couponAllocation, BigDecimal netSaleAmount,
                     BigDecimal courseDiscountAmount, BigDecimal discountAmount,
                     BigDecimal instructorAmount, BigDecimal platformAmount) {
            this.grossAmount = grossAmount;
            this.couponAllocation = couponAllocation;
            this.netSaleAmount = netSaleAmount;
            this.courseDiscountAmount = courseDiscountAmount;
            this.discountAmount = discountAmount;
            this.instructorAmount = instructorAmount;
            this.platformAmount = platformAmount;
        }
    }
}
