package com.gnostica.modules.order.service;

import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.modules.order.dto.response.OrderResponse;
import com.gnostica.modules.order.dto.response.OrderDetailResponse;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.Coupon;
import com.gnostica.modules.settings.service.CommissionResolver;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.OrderDetailRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.util.AuthUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;
import com.gnostica.core.constant.OrderStatus;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.util.stream.Collectors;
import com.gnostica.modules.wallet.service.WalletService;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private static final Set<String> SUPPORTED_PAYMENT_METHODS = Set.of("PAYOS", "VNPAY", "WALLET");
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final PaymentService paymentService;
    private final CommissionResolver commissionResolver;
    private final WalletService walletService;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getMyOrders(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found for email: " + email));
        return orderRepository.findByAccountOrderByIdDesc(account).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    public OrderResponse getOrderById(UUID id) throws Exception {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + id));
        assertCanReadOrder(order);
        return mapToResponse(checkAndReturnOrder(order));
    }

    public OrderResponse getOrderByTransactionId(String transactionId) throws Exception {
        // Find order by transactionId by filtering or custom repository method.
        // If repository doesn't have it, we fallback to id search.
        Order order = orderRepository.findAll().stream()
                .filter(o -> transactionId.equals(o.getId().toString())) // Assuming transactionId might just be the order ID for now
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Order not found with Transaction ID: " + transactionId));
        assertCanReadOrder(order);
        return mapToResponse(checkAndReturnOrder(order));
    }

    public OrderResponse getOrderByOrderCode(Long orderCode) throws Exception {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with orderCode: " + orderCode));
        assertCanReadOrder(order);
        return mapToResponse(checkAndReturnOrder(order));
    }

    private Order checkAndReturnOrder(Order order) throws Exception {
        // 0: PENDING
        if (order.getStatus() == 0) {
            try {
                paymentService.checkPaymentStatus(order);
            } catch (Exception e) {
                log.warn("Không thể kiểm tra trạng thái PayOS cho order {}: {}", order.getId(), e.getMessage());
            }
            return orderRepository.findById(order.getId()).orElse(order);
        }
        return order;
    }

    private void assertCanReadOrder(Order order) {
        String email = AuthUtil.getCurrentUserEmail();
        if (email == null) {
            throw new org.springframework.security.access.AccessDeniedException("Authentication is required");
        }
        Account current = accountRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Current account does not exist"));
        boolean isAdmin = current.getRole() != null && "ADMIN".equalsIgnoreCase(current.getRole().getName());
        if (!isAdmin && (order.getAccount() == null || !current.getId().equals(order.getAccount().getId()))) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot access another user's order");
        }
    }

    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        return createPaymentLink(requestBody, false);
    }

    /**
     * Gift orders are persisted before an already-paid free/wallet order emits its
     * success event; otherwise the buyer would be enrolled instead of the recipient.
     */
    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody, boolean deferImmediateSuccess) throws Exception {
        String email = AuthUtil.getCurrentUserEmail();
        if (email == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Account not found for email: " + email));

        Course course = courseRepository.findById(requestBody.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found for ID: " + requestBody.getCourseId()));

        long orderCode = System.currentTimeMillis();
        String paymentMethod = normalizePaymentMethod(requestBody.getPaymentMethod());

        // The server is the source of truth for pricing. Never trust a client-submitted total.
        BigDecimal actualPrice = course.getSalePrice();
        
        Coupon appliedCoupon = null;
        if (requestBody.getCouponCode() != null && !requestBody.getCouponCode().trim().isEmpty()) {
            appliedCoupon = couponService.getValidCoupon(requestBody.getCouponCode());
            
            couponService.assertCouponAppliesToCourse(appliedCoupon, course);

            // Reserve a use while the payment link is pending. It is consumed only
            // after a successful payment and released by the expiry scheduler.
            if (appliedCoupon.getQuantity() != null) {
                int reserved = appliedCoupon.getReservedQuantity() == null ? 0 : appliedCoupon.getReservedQuantity();
                appliedCoupon.setReservedQuantity(reserved + 1);
                couponRepository.save(appliedCoupon);
            }
            
            // Calculate discount
            BigDecimal discountValue = appliedCoupon.getDiscountValue();
            if (appliedCoupon.getDiscountType() == 1) { // Percentage
                BigDecimal percentage = discountValue.divide(BigDecimal.valueOf(100));
                BigDecimal discountAmount = actualPrice.multiply(percentage);
                if (appliedCoupon.getMaxDiscount() != null && discountAmount.compareTo(appliedCoupon.getMaxDiscount()) > 0) {
                    discountAmount = appliedCoupon.getMaxDiscount();
                }
                actualPrice = actualPrice.subtract(discountAmount);
            } else { // Fixed amount
                actualPrice = actualPrice.subtract(discountValue);
            }
            
            if (actualPrice.compareTo(BigDecimal.ZERO) < 0) {
                actualPrice = BigDecimal.ZERO;
            }
        }

        Order order = saveOrder(account, appliedCoupon, actualPrice, String.valueOf(orderCode), paymentMethod);
        OrderDetail detail = saveOrderDetail(order, course, actualPrice);

        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);
        order.setDetails(details);

        // If price is 0, we can bypass payment gateway
        if (actualPrice.compareTo(BigDecimal.ZERO) == 0) {
            order.setPaymentMethod("FREE/COUPON");
            orderRepository.save(order);
            if (!deferImmediateSuccess) {
                paymentService.processSuccessfulOrder(order);
            }
            // Return a dummy link or custom response
            return PaymentLinkResponse.builder()
                .bin("N/A").accountNumber("N/A").accountName("FREE")
                .amount(0L).description("Miễn phí")
                .orderCode(orderCode)
                .paymentLinkId("FREE-" + orderCode).status("PAID")
                .checkoutUrl(requestBody.getReturnUrl() + "?orderCode=" + orderCode)
                .qrCode("").build();
        }

        if ("WALLET".equals(paymentMethod)) {
            com.gnostica.core.model.Wallet walletBalance = walletService.getWalletByAccount(account);
            if (walletBalance.getRemain().compareTo(actualPrice) < 0) {
                throw new IllegalArgumentException("Số dư khả dụng không đủ để thanh toán!");
            }

            // Create a pseudo webhook data to save transaction
            com.gnostica.modules.payment.dto.response.PaymentWebhookData data = com.gnostica.modules.payment.dto.response.PaymentWebhookData.builder()
                .gateway("WALLET")
                .transactionCode("WALLET-" + orderCode)
                .amount(actualPrice.longValue())
                .status("PAID")
                .paidAt(java.time.LocalDateTime.now())
                .payload(new java.util.HashMap<>())
                .build();
            
            paymentService.saveTransaction(data, order);
            
            if (!deferImmediateSuccess) {
                paymentService.processSuccessfulOrder(order);
            }
            
            return PaymentLinkResponse.builder()
                .bin("N/A").accountNumber("N/A").accountName(account.getFullName())
                .amount(actualPrice.longValue()).description("Thanh toán bằng số dư ví")
                .orderCode(orderCode)
                .paymentLinkId("WALLET-" + orderCode).status("PAID")
                .checkoutUrl(requestBody.getReturnUrl() + "?orderCode=" + orderCode)
                .qrCode("").build();
        }

        return paymentService.createPaymentLink(order, requestBody.getReturnUrl(), requestBody.getCancelUrl());
    }

    private Order saveOrder(Account account, Coupon coupon, BigDecimal totalPrice, String transactionId,
            String paymentMethod) {
        Order order = new Order();
        order.setAccount(account);
        order.setCoupon(coupon);
        order.setTotalPrice(totalPrice);
        order.setPaymentMethod(paymentMethod);
        order.setStatus(OrderStatus.PENDING);
        try {
            order.setOrderCode(Long.parseLong(transactionId));
        } catch (NumberFormatException e) {
            log.warn("Lỗi parse transactionId sang orderCode: {}", transactionId);
        }
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private String normalizePaymentMethod(String paymentMethod) {
        String normalized = paymentMethod == null || paymentMethod.isBlank()
                ? "PAYOS"
                : paymentMethod.trim().toUpperCase(Locale.ROOT);
        if (!SUPPORTED_PAYMENT_METHODS.contains(normalized)) {
            throw new IllegalArgumentException("Unsupported payment method: " + paymentMethod);
        }
        return normalized;
    }

    private OrderDetail saveOrderDetail(Order order, Course course, BigDecimal actualPrice) {
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setCourse(course);
        if (course.getAccount() != null) {
            detail.setCommission(commissionResolver.resolve(course.getAccount(), LocalDateTime.now()).source());
        }
        detail.setPrice(actualPrice);
        detail.setDiscount(course.getDiscount() != null ? course.getDiscount().intValue() : 0);
        detail.setStatus(1); // 1: Valid
        return orderDetailRepository.save(detail);
    }
    
    private OrderResponse mapToResponse(Order order) {
        OrderResponse resp = new OrderResponse();
        resp.setId(order.getId());
        resp.setOrderCode(order.getOrderCode());
        if (order.getAccount() != null) {
            resp.setAccountId(order.getAccount().getId());
            resp.setAccountName(order.getAccount().getFullName());
            resp.setAccountEmail(order.getAccount().getEmail());
        }
        if (order.getCoupon() != null) {
            resp.setCouponId(order.getCoupon().getId());
            resp.setCouponCode(couponService.getDisplayCode(order.getCoupon()));
        }
        resp.setTotalPrice(order.getTotalPrice());
        resp.setPaymentMethod(order.getPaymentMethod());
        resp.setTransactionId(order.getId().toString()); // Use ID as transaction ID mapping for now
        resp.setStatus(order.getStatus());
        resp.setCreatedAt(order.getCreatedAt());
        resp.setUpdatedAt(order.getUpdatedAt());
        
        if (order.getDetails() != null) {
            resp.setDetails(order.getDetails().stream().map(d -> {
                OrderDetailResponse dr = new OrderDetailResponse();
                dr.setId(d.getId());
                if (d.getCourse() != null) {
                    dr.setCourseId(d.getCourse().getId());
                    dr.setCourseName(d.getCourse().getTitle());
                }
                dr.setPrice(d.getPrice());
                dr.setDiscount(d.getDiscount());
                dr.setStatus(d.getStatus());
                dr.setCreatedAt(d.getCreatedAt());
                return dr;
            }).collect(Collectors.toList()));
        }
        return resp;
    }
}
