package com.gnostica.modules.payment.service.impl;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.response.PaymentDetails;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.event.PaymentSuccessEvent;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.service.PaymentStrategy;
import com.gnostica.modules.payment.service.PaymentStrategyFactory;
import com.gnostica.modules.wallet.service.WalletService;
import com.gnostica.modules.integration.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentStrategyFactory paymentStrategyFactory;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final com.gnostica.modules.payment.service.PayOSPaymentLinkCacheService payOSPaymentLinkCacheService;
    private final WalletService walletService;
    private final MailService mailService;

    @Override
    public PaymentLinkResponse createPaymentLink(Order order, String returnUrl, String cancelUrl) throws Exception {
        String gateway = order.getPaymentMethod();
        if (gateway == null) {
            gateway = "PAYOS"; // Mặc định
        }
        
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(gateway);
        if (strategy == null) {
            throw new IllegalArgumentException("Không hỗ trợ phương thức thanh toán: " + gateway);
        }
        PaymentLinkResponse response = strategy.createPaymentLink(order, returnUrl, cancelUrl);
        if ("PAYOS".equalsIgnoreCase(gateway)) {
            long expiresAt = System.currentTimeMillis() + 5 * 60 * 1000L;
            response.setExpiresAt(expiresAt);
            payOSPaymentLinkCacheService.store(order.getAccount().getId(), order.getDetails().get(0).getCourse().getId(), response);
        }
        return response;
    }

    @Override
    public PaymentWebhookData verifyWebhook(String gateway, Object body) throws Exception {
        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(gateway);
        return strategy.verifyWebhook(body);
    }

    @Override
    @Transactional
    public void checkPaymentStatus(Order order) throws Exception {
        if (order == null || order.getOrderCode() == null) {
            return;
        }

        Order lockedOrder = orderRepository.findByOrderCodeForUpdate(order.getOrderCode()).orElse(null);
        if (lockedOrder == null || lockedOrder.getStatus() == OrderStatus.PAID) {
            return;
        }

        PaymentStrategy strategy = paymentStrategyFactory.getStrategy(lockedOrder.getPaymentMethod());
        PaymentDetails paymentLink = strategy.getPaymentDetails(lockedOrder);
        String gatewayStatus = paymentLink == null || paymentLink.getStatus() == null
                ? "UNAVAILABLE" : paymentLink.getStatus();

        if ("PAID".equals(gatewayStatus)) {
            log.info("Order {} confirmed as PAID via server-side polling", lockedOrder.getId());
            processSuccessfulOrder(lockedOrder);

            // Lấy thêm details từ PayOS để lưu transaction với bank info
            try {
                if (paymentLink != null) {
                    saveTransactionFromPolling(paymentLink, lockedOrder);
                }
            } catch (Exception e) {
                log.warn("Không thể lấy payment details để lưu transaction: {}", e.getMessage());
            }
        } else if ("FAILED".equals(gatewayStatus) && "VNPAY".equalsIgnoreCase(lockedOrder.getPaymentMethod())) {
            // A terminal gateway failure frees the pending checkout. Query
            // errors remain pending and are retried by the scheduler.
            saveTransactionFromPolling(paymentLink, lockedOrder);
            lockedOrder.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(lockedOrder);
            releaseCouponReservation(lockedOrder);
            log.info("VNPay reported terminal failure for order {}", lockedOrder.getId());
        }
    }

    @Override
    public void cancelPayment(Order order, String reason) throws Exception {
        if (!"PAYOS".equalsIgnoreCase(order.getPaymentMethod())) {
            return;
        }
        paymentStrategyFactory.getStrategy("PAYOS").cancelPayment(order, reason);
    }

    @Override
    @Transactional
    public void handlePaymentWebhook(PaymentWebhookData data) {
        if (data == null || data.getOrderCode() == null) {
            throw new IllegalArgumentException("Missing order code in PayOS webhook");
        }
        if (!"PAID".equals(data.getStatus())) {
            throw new IllegalArgumentException("PayOS webhook does not confirm a successful payment");
        }
        if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
            throw new IllegalArgumentException("Missing PayOS transaction code");
        }

        Long orderCode = data.getOrderCode();
        log.info("Webhook triggered for orderCode: {}", orderCode);

        Order order = orderRepository.findByOrderCodeForUpdate(orderCode)
                .orElse(null);

        if (order == null) {
            log.warn("Ignoring PayOS webhook for unknown orderCode: {}", orderCode);
            return;
        }
        if (!"PAYOS".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new IllegalArgumentException("Order does not use PayOS");
        }

        if (data.getAmount() == null || order.getTotalPrice().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
                throw new IllegalArgumentException("Payment amount does not match order total");
            }
            if (order.getStatus() == OrderStatus.PENDING) {
                processSuccessfulOrder(order);
                saveTransaction(data, order);
                log.info("Payment processed successfully for order: {}", order.getId());
            } else if (order.getStatus() == OrderStatus.CANCELLED && "PAID".equals(data.getStatus())) {
                // PayOS may retry the same signed webhook.  A late payment is
                // refunded to the internal wallet exactly once, keyed by the
                // gateway transaction/payment-link identifier.
                boolean alreadyRecorded = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                        "PAYOS", data.getTransactionCode());
                saveTransaction(data, order);
                if (alreadyRecorded) {
                    log.info("Ignoring duplicate late PayOS webhook for order {}", order.getId());
                    return;
                }
                walletService.addDeposit(order.getAccount(), BigDecimal.valueOf(data.getAmount()), data.getTransactionCode());
                try {
                    mailService.sendEmail(
                        order.getAccount().getEmail(),
                        "Thông báo về khoản thanh toán cho đơn hàng đã hết hạn",
                        "Chào bạn,\n\nHệ thống đã nhận được số tiền " + data.getAmount() + " VND từ bạn. Tuy nhiên đơn hàng " + data.getOrderCode() + " của bạn đã hết hạn trước khi giao dịch được xác nhận. Chúng tôi đã tự động cộng số tiền này vào Ví Gnostica của bạn. Bạn có thể sử dụng số dư này để thanh toán lại hoặc mua các khóa học khác.\n\nTrân trọng,\nĐội ngũ Gnostica"
                    );
                } catch (Exception e) {
                    log.error("Failed to send overdue payment email to {}: {}", order.getAccount().getEmail(), e.getMessage());
                }
                log.info("Overdue payment processed as wallet deposit for order: {}", order.getId());
            }
    }

    @Override
    @Transactional
    public void processSuccessfulOrder(Order order) {
        if (order == null || order.getStatus() == OrderStatus.PAID) {
            return;
        }

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
        consumeCouponReservation(order);

        eventPublisher.publishEvent(new PaymentSuccessEvent(this, order, order.getTotalPrice()));
    }

    private void consumeCouponReservation(Order order) {
        if (order.getCoupon() == null || order.getCoupon().getQuantity() == null) {
            return;
        }
        com.gnostica.core.model.Coupon coupon = order.getCoupon();
        int reserved = coupon.getReservedQuantity() == null ? 0 : coupon.getReservedQuantity();
        coupon.setReservedQuantity(Math.max(0, reserved - 1));
        coupon.setQuantity(Math.max(0, coupon.getQuantity() - 1));
        couponRepository.save(coupon);
    }

    private void releaseCouponReservation(Order order) {
        if (order.getCoupon() == null || order.getCoupon().getReservedQuantity() == null) {
            return;
        }
        com.gnostica.core.model.Coupon coupon = order.getCoupon();
        coupon.setReservedQuantity(Math.max(0, coupon.getReservedQuantity() - 1));
        couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public void saveTransaction(PaymentWebhookData data, Order order) {
        // Tránh tạo transaction trùng lặp
        String gateway = data.getGateway() != null ? data.getGateway() : order.getPaymentMethod();
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

    @Override
    @Transactional
    public VNPayIpnResponse handleVNPayIpn(Map<String, String> parameters) {
        PaymentWebhookData data;
        try {
            data = paymentStrategyFactory.getStrategy("VNPAY").verifyWebhook(parameters);
        } catch (IllegalArgumentException exception) {
            log.warn("Rejected VNPay IPN: {}", exception.getMessage());
            if (exception.getMessage() != null
                    && (exception.getMessage().contains("signature") || exception.getMessage().contains("merchant"))) {
                return VNPayIpnResponse.invalidSignature();
            }
            return VNPayIpnResponse.invalidRequest();
        } catch (Exception exception) {
            log.error("Unable to verify VNPay IPN", exception);
            return VNPayIpnResponse.invalidRequest();
        }

        Order order = orderRepository.findByOrderCodeForUpdate(data.getOrderCode()).orElse(null);
        if (order == null || !"VNPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            return VNPayIpnResponse.orderNotFound();
        }
        if (order.getStatus() == OrderStatus.PAID) {
            return VNPayIpnResponse.alreadyProcessed();
        }
        if (data.getAmount() == null
                || order.getTotalPrice().compareTo(BigDecimal.valueOf(data.getAmount())) != 0) {
            return VNPayIpnResponse.invalidAmount();
        }
        if ("PAID".equals(data.getStatus()) && order.getStatus() == OrderStatus.CANCELLED) {
            if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
                return VNPayIpnResponse.invalidRequest();
            }
            boolean alreadyRecorded = paymentRepository.existsByGatewayAndGatewayTransactionNo(
                    "VNPAY", data.getTransactionCode());
            saveTransaction(data, order);
            if (!alreadyRecorded) {
                walletService.addDeposit(order.getAccount(), BigDecimal.valueOf(data.getAmount()), data.getTransactionCode());
            }
            log.info("Late VNPay payment credited to wallet for expired order {}", order.getId());
            return VNPayIpnResponse.success();
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            return VNPayIpnResponse.alreadyProcessed();
        }
        if (!"PAID".equals(data.getStatus())) {
            log.info("VNPay reported non-successful transaction for order {}", order.getId());
            // A cancellation can legitimately have no VNPay transaction
            // number. It must still close the local pending order.
            if (hasGatewayTransactionCode(data.getTransactionCode())) {
                saveTransaction(data, order);
            }
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
                releaseCouponReservation(order);
            }
            return VNPayIpnResponse.success();
        }
        if (data.getTransactionCode() == null || data.getTransactionCode().isBlank()) {
            return VNPayIpnResponse.invalidRequest();
        }

        processSuccessfulOrder(order);
        saveTransaction(data, order);
        log.info("VNPay payment processed successfully for order {}", order.getId());
        return VNPayIpnResponse.success();
    }

    @Transactional
    public void saveTransactionFromPolling(PaymentDetails link, Order order) {
        // Tránh tạo transaction trùng lặp (bỏ qua giao dịch REVENUE)
        String gateway = link.getGateway() != null ? link.getGateway() : order.getPaymentMethod();
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

    private boolean hasGatewayTransactionCode(String transactionCode) {
        return transactionCode != null && !transactionCode.isBlank() && !"0".equals(transactionCode.trim());
    }
}
