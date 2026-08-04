package com.gnostica.modules.order.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Order;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.service.PayosService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Performs every pending-order cancellation through one locked code path. */
@Service
@RequiredArgsConstructor
public class PendingOrderCancellationService {
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final PaymentService paymentService;
    private final PayosService payosService;

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public boolean cancelPendingOrder(Long orderCode, String reason, boolean cancelGatewayPayment) throws Exception {
        Order order = orderRepository.findByOrderCodeForUpdate(orderCode).orElse(null);
        if (order == null || order.getStatus() != OrderStatus.PENDING) {
            return false;
        }
        if (cancelGatewayPayment) {
            paymentService.cancelPayment(order, reason);
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        releaseReservedCoupon(order);
        clearPendingPayOSPaymentLink(order);
        return true;
    }

    private void releaseReservedCoupon(Order order) {
        Coupon orderCoupon = order.getCoupon();
        if (orderCoupon == null) {
            return;
        }
        Coupon coupon = couponRepository.findByIdForUpdate(orderCoupon.getId()).orElse(null);
        if (coupon == null || coupon.getReservedQuantity() == null) {
            return;
        }
        coupon.setReservedQuantity(Math.max(0, coupon.getReservedQuantity() - 1));
        couponRepository.save(coupon);
    }

    private void clearPendingPayOSPaymentLink(Order order) {
        if (!"PAYOS".equalsIgnoreCase(order.getPaymentMethod()) || order.getAccount() == null
                || order.getDetails() == null || order.getDetails().isEmpty()) {
            return;
        }
        Course course = order.getDetails().get(0).getCourse();
        if (course != null) {
            payosService.clearPendingLink(order.getAccount().getId(), course.getId());
        }
    }
}
