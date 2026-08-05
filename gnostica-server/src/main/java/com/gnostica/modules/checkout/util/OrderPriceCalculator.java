package com.gnostica.modules.checkout.util;

import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Uses only order snapshots; never reads a course's current price or discount. */
public final class OrderPriceCalculator {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private OrderPriceCalculator() {
    }

    public static BigDecimal amountAfterCourseDiscount(OrderDetail detail) {
        BigDecimal originalPrice = detail.getPrice() == null ? BigDecimal.ZERO : detail.getPrice();
        int discount = detail.getDiscount() == null ? 0 : detail.getDiscount();
        BigDecimal discountAmount = originalPrice.multiply(BigDecimal.valueOf(discount))
                .divide(ONE_HUNDRED)
                .setScale(0, RoundingMode.HALF_UP);
        return originalPrice.subtract(discountAmount);
    }

    public static BigDecimal subtotalAfterCourseDiscount(List<OrderDetail> details) {
        return details.stream().filter(detail -> detail.getStatus() != null && detail.getStatus() == 1)
                .map(OrderPriceCalculator::amountAfterCourseDiscount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public static BigDecimal couponAllocation(Order order, OrderDetail detail, List<OrderDetail> details) {
        BigDecimal couponPrice = order.getCouponPrice() == null ? BigDecimal.ZERO : order.getCouponPrice();
        BigDecimal subtotal = subtotalAfterCourseDiscount(details);
        if (couponPrice.signum() <= 0 || subtotal.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        // With the current one-course checkout this returns the exact amount.
        // The proportional rule also keeps a future multi-course order fair.
        return couponPrice.multiply(amountAfterCourseDiscount(detail))
                .divide(subtotal, 6, RoundingMode.HALF_UP);
    }

    public static BigDecimal amountPaidForDetail(Order order, OrderDetail detail, List<OrderDetail> details) {
        return amountAfterCourseDiscount(detail).subtract(couponAllocation(order, detail, details))
                .max(BigDecimal.ZERO);
    }
}

