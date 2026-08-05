package com.gnostica.modules.checkout.util;

import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OrderPriceCalculatorTest {

    @Test
    void calculatesThePaidLineFromTheOrderSnapshots() {
        Order order = new Order();
        order.setCouponPrice(new BigDecimal("27510"));

        OrderDetail detail = new OrderDetail();
        detail.setPrice(new BigDecimal("393000"));
        detail.setDiscount(20);
        detail.setStatus(1);
        List<OrderDetail> details = List.of(detail);

        assertEquals(new BigDecimal("314400"), OrderPriceCalculator.amountAfterCourseDiscount(detail));
        assertEquals(new BigDecimal("27510.000000"),
                OrderPriceCalculator.couponAllocation(order, detail, details));
        assertEquals(new BigDecimal("286890.000000"),
                OrderPriceCalculator.amountPaidForDetail(order, detail, details));
    }
}
