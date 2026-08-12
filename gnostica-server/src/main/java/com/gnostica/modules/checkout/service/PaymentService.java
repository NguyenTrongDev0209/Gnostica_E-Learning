package com.gnostica.modules.checkout.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.modules.checkout.dto.response.PaymentLinkResponse;
import com.gnostica.modules.checkout.dto.response.PaymentWebhookData;
import com.gnostica.core.repository.GiftRepository;
import com.gnostica.modules.wallet.service.WalletService;
import com.gnostica.modules.user.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PayosService payosService;
    private final VnpayService vnpayService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final GiftRepository giftRepository;
    private final WalletService walletService;
    private final NotificationService notificationService;

    // === Routing ===
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception {
        return switch (gateway(order)) {
            case "PAYOS" -> payosService.createPaymentLink(order, returnUrl, cancelUrl);
            case "VNPAY" -> vnpayService.createPaymentLink(order, returnUrl, cancelUrl);
            default -> throw new IllegalArgumentException("Unsupported gateway: " + gateway(order));
        };
    }

    public void cancelPayment(Order order, String reason) throws Exception {
        if ("PAYOS".equals(gateway(order))) {
            payosService.cancelPayment(order, reason);
        }
    }
    
    @Transactional
    public void checkPaymentStatus(Order order) throws Exception {
        if (order == null || order.getOrderCode() == null) {
            return;
        }

        Order lockedOrder = orderRepository.findByOrderCodeForUpdate(order.getOrderCode()).orElse(null);
        if (lockedOrder == null || lockedOrder.getStatus() == OrderStatus.PAID) {
            return;
        }
        
        boolean isPaid = switch (gateway(lockedOrder)) {
            case "PAYOS" -> payosService.checkPaymentStatus(lockedOrder);
            case "VNPAY" -> vnpayService.checkPaymentStatus(lockedOrder);
            default -> false;
        };
        
        if (isPaid) {
            log.info("Order {} confirmed as PAID via server-side polling", lockedOrder.getId());
            processSuccessfulOrder(lockedOrder);
            
            try {
                if ("PAYOS".equals(gateway(lockedOrder))) {
                    saveTransactionFromPolling(payosService.getPaymentDetails(lockedOrder), lockedOrder);
                } else if ("VNPAY".equals(gateway(lockedOrder))) {
                    saveTransactionFromPolling(vnpayService.getPaymentDetails(lockedOrder), lockedOrder);
                }
            } catch (Exception e) {
                log.warn("Không thể lấy payment details để lưu transaction: {}", e.getMessage());
            }
        }
    }

    // === Shared Logic ===
    @Transactional
    public void processSuccessfulOrder(Order order) {
        if (order == null || order.getStatus() == OrderStatus.PAID) {
            return;
        }

        // Prevent double processing if user is already enrolled (skip this check for gifts)
        if (order.getDetails() != null && !order.getDetails().isEmpty()) {
            com.gnostica.core.model.Course course = order.getDetails().get(0).getCourse();
            boolean alreadyEnrolled = enrollmentRepository.existsByAccountAndCourseAndStatusIn(
                    order.getAccount(), course, java.util.List.of(1));
            boolean isGiftOrder = giftRepository.existsByOrder(order);
            
            if (alreadyEnrolled && !isGiftOrder) {
                log.info("User {} already enrolled in course {}. Skipping coupon consumption and enrollment for duplicate order {}",
                        order.getAccount().getId(), course.getId(), order.getId());
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);
                releaseCouponReservation(order);
                
                walletService.addDeposit(order.getAccount(), order.getTotalPrice(), String.valueOf(order.getOrderCode()));
                notificationService.createNotification(order.getAccount(), "Đã hoàn tiền vào ví", "Bạn đã sở hữu khóa " + course.getTitle() + "; số tiền " + order.getTotalPrice() + " đã được cộng vào Ví Gnostica.", "REFUND_AUTO", String.valueOf(order.getId()));
                
                return;
            }
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
        consumeCouponReservation(order);

        eventPublisher.publishEvent(new PaymentSuccessEvent(this, order, order.getTotalPrice()));
    }

    @Transactional
    public void saveTransaction(PaymentWebhookData data, Order order) {
        String gateway = data.getGateway() != null ? data.getGateway() : gateway(order);
        boolean paymentExists = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                gateway, data.getTransactionCode());
        if (paymentExists) {
            return;
        }

        Payment payment = new Payment();
        payment.setTransactionCode(data.getTransactionCode());
        payment.setAmount(BigDecimal.valueOf(data.getAmount()));
        if ("PAID".equals(data.getStatus())) {
            payment.setStatus(PaymentStatus.SUCCESS);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        payment.setGateway(gateway);
        payment.setGatewayTransactionNo(data.getTransactionCode());
        payment.setPaidAt(data.getPaidAt() != null ? data.getPaidAt() : LocalDateTime.now());
        payment.setPayload(data.getPayload());
        payment.setOrder(order);

        paymentRepository.save(payment);
    }
    
    @Transactional
    public void saveTransactionFromPolling(com.gnostica.modules.checkout.dto.response.PaymentDetails link, Order order) {
        String gateway = link.getGateway() != null ? link.getGateway() : gateway(order);
        boolean paymentExists = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                gateway, link.getTransactionCode());

        if (paymentExists) {
            return;
        }

        Payment payment = new Payment();
        payment.setTransactionCode(link.getTransactionCode());
        payment.setAmount(BigDecimal.valueOf(link.getAmount()));
        payment.setStatus("PAID".equals(link.getStatus()) ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setOrder(order);
        payment.setGateway(gateway);
        payment.setGatewayTransactionNo(link.getTransactionCode());
        payment.setPaidAt(link.getPaidAt() != null ? link.getPaidAt() : LocalDateTime.now());
        payment.setPayload(link.getPayload());

        paymentRepository.save(payment);
    }

    // === Coupon Management ===
    private void consumeCouponReservation(Order order) {
        if (order.getCoupon() == null || order.getCoupon().getQuantity() == null) {
            return;
        }
        com.gnostica.core.model.Coupon coupon = couponRepository.findByIdForUpdate(order.getCoupon().getId())
                .orElseThrow(() -> new IllegalStateException("Coupon no longer exists"));
        int reserved = coupon.getReservedQuantity() == null ? 0 : coupon.getReservedQuantity();
        coupon.setReservedQuantity(Math.max(0, reserved - 1));
        coupon.setQuantity(Math.max(0, coupon.getQuantity() - 1));
        couponRepository.save(coupon);
    }

    public void releaseCouponReservation(Order order) {
        if (order.getCoupon() == null || order.getCoupon().getReservedQuantity() == null) {
            return;
        }
        com.gnostica.core.model.Coupon coupon = couponRepository.findByIdForUpdate(order.getCoupon().getId())
                .orElseThrow(() -> new IllegalStateException("Coupon no longer exists"));
        coupon.setReservedQuantity(Math.max(0, coupon.getReservedQuantity() - 1));
        couponRepository.save(coupon);
    }

    private String gateway(Order order) {
        return order.getPaymentMethod() == null ? "PAYOS" : order.getPaymentMethod().toUpperCase();
    }

    @Transactional
    public void markNonWalletPaymentsRefunded(Order order) {
        if (order == null) return;
        java.util.List<Payment> payments = paymentRepository.findByOrder(order);
        for (Payment p : payments) {
            if (!"WALLET".equalsIgnoreCase(p.getGateway()) && p.getStatus() == PaymentStatus.SUCCESS) {
                p.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(p);
            }
        }
    }
}

