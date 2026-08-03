package com.gnostica.modules.order.service;

import com.gnostica.modules.payment.service.PaymentService;
import com.gnostica.modules.payment.service.PayOSPaymentLinkCacheService;
import com.gnostica.core.config.VNPayProperties;
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
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.util.AuthUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

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
    public static final String ACCOUNT_NOT_ELIGIBLE = "ACCOUNT_NOT_ELIGIBLE";
    public static final String COURSE_NOT_AVAILABLE = "COURSE_NOT_AVAILABLE";
    public static final String OWN_COURSE_PURCHASE_NOT_ALLOWED = "OWN_COURSE_PURCHASE_NOT_ALLOWED";
    public static final String ALREADY_ENROLLED = "ALREADY_ENROLLED";
    private static final Set<String> SUPPORTED_PAYMENT_METHODS = Set.of("PAYOS", "VNPAY", "WALLET");
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final CouponRepository couponRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CouponService couponService;
    private final PaymentService paymentService;
    private final CommissionResolver commissionResolver;
    private final WalletService walletService;
    private final PayOSPaymentLinkCacheService payOSPaymentLinkCacheService;
    private final VNPayProperties vnPayProperties;

    @Value("${payos.webhook-enabled:false}")
    private boolean payosWebhookEnabled;

    @Value("${app.public-url}")
    private String publicUrl;

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

    @Transactional
    public OrderResponse cancelPendingOrder(Long orderCode) throws Exception {
        Order order = orderRepository.findByOrderCodeForUpdate(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        assertCanReadOrder(order);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return mapToResponse(order);
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only pending orders can be cancelled");
        }

        // Cancel the PayOS link first. If PayOS refuses because the payment was
        // completed concurrently, the local order is deliberately left pending.
        paymentService.cancelPayment(order, "Cancelled by customer");
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        clearPendingPayOSPaymentLink(order);
        releaseReservedCoupon(order);
        return mapToResponse(order);
    }

    private Order checkAndReturnOrder(Order order) throws Exception {
        // 0: PENDING
        // VNPay QueryDR is performed by the dedicated scheduler. Reading an
        // order must not create a second gateway request for every UI refresh.
        if (order.getStatus() == OrderStatus.PENDING && shouldPollPaymentGateway(order)) {
            try {
                paymentService.checkPaymentStatus(order);
            } catch (Exception e) {
                log.warn("Không thể kiểm tra trạng thái PayOS cho order {}: {}", order.getId(), e.getMessage());
            }
            return orderRepository.findById(order.getId()).orElse(order);
        }
        return order;
    }

    private boolean shouldPollPaymentGateway(Order order) {
        if ("PAYOS".equalsIgnoreCase(order.getPaymentMethod())) {
            return !payosWebhookEnabled;
        }
        if ("VNPAY".equalsIgnoreCase(order.getPaymentMethod())) {
            return false;
        }
        return false;
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

    @Transactional(rollbackFor = Exception.class)
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

        if (requestBody == null || requestBody.getCourseId() == null) {
            throw new IllegalArgumentException(COURSE_NOT_AVAILABLE);
        }

        Course course = courseRepository.findById(requestBody.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException(COURSE_NOT_AVAILABLE));

        assertCourseCanBePurchased(course, account, deferImmediateSuccess);

        long orderCode = System.currentTimeMillis();
        String paymentMethod = normalizePaymentMethod(requestBody.getPaymentMethod());

        if ("PAYOS".equals(paymentMethod)) {
            PaymentLinkResponse pendingPayment = findReusablePendingPayOSPayment(account, course);
            if (pendingPayment != null) {
                return pendingPayment;
            }
        }
        if ("VNPAY".equals(paymentMethod)) {
            PaymentLinkResponse pendingPayment = findReusablePendingVNPayPayment(account, course);
            if (pendingPayment != null) {
                return pendingPayment;
            }
        }

        // Snapshot the catalogue price and the course-level percentage on the
        // detail. The amount due is calculated separately on the order.
        BigDecimal originalCoursePrice = course.getPrice();
        int courseDiscount = course.getDiscount() == null ? 0 : course.getDiscount();
        BigDecimal courseDiscountAmount = originalCoursePrice
                .multiply(BigDecimal.valueOf(courseDiscount))
                .divide(BigDecimal.valueOf(100))
                .setScale(0, java.math.RoundingMode.HALF_UP);
        BigDecimal subtotalAfterCourseDiscount = originalCoursePrice.subtract(courseDiscountAmount);
        
        Coupon appliedCoupon = null;
        BigDecimal couponPrice = BigDecimal.ZERO;
        if (requestBody.getCouponCode() != null && !requestBody.getCouponCode().trim().isEmpty()) {
            appliedCoupon = couponService.getValidCoupon(requestBody.getCouponCode());
            
            couponService.assertCouponAppliesToCourse(appliedCoupon, course);

            // With one line today this is the eligible subtotal. When orders
            // accept multiple courses, this value becomes the sum of only the
            // details that match the coupon's scope.
            couponPrice = couponService.calculateDiscountAmount(appliedCoupon, subtotalAfterCourseDiscount);

            // Reserve a use while the payment link is pending. It is consumed only
            // after a successful payment and released by the expiry scheduler.
            if (appliedCoupon.getQuantity() != null) {
                int reserved = appliedCoupon.getReservedQuantity() == null ? 0 : appliedCoupon.getReservedQuantity();
                appliedCoupon.setReservedQuantity(reserved + 1);
                couponRepository.save(appliedCoupon);
            }
        }

        BigDecimal actualPrice = subtotalAfterCourseDiscount.subtract(couponPrice).max(BigDecimal.ZERO);

        Order order = saveOrder(account, appliedCoupon, couponPrice, actualPrice,
                String.valueOf(orderCode), paymentMethod);
        OrderDetail detail = saveOrderDetail(order, course, originalCoursePrice, courseDiscount);

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
                .checkoutUrl(trustedReturnUrl() + "?orderCode=" + orderCode)
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
                .checkoutUrl(trustedReturnUrl() + "?orderCode=" + orderCode)
                .qrCode("").build();
        }

        return paymentService.createPaymentLink(order, trustedReturnUrl(), trustedCancelUrl());
    }

    private void assertCourseCanBePurchased(Course course, Account buyer, boolean isGiftOrder) {
        if (buyer.getStatus() == null || buyer.getStatus() != 1 || buyer.getDeletedAt() != null) {
            throw new IllegalArgumentException(ACCOUNT_NOT_ELIGIBLE);
        }
        if (course.getStatus() != 1 || Boolean.TRUE.equals(course.getDeleted())) {
            throw new IllegalArgumentException(COURSE_NOT_AVAILABLE);
        }
        if (!isCategoryActive(course.getCategory(), new java.util.HashSet<>())) {
            throw new IllegalArgumentException(COURSE_NOT_AVAILABLE);
        }
        if (isGiftOrder) {
            return;
        }
        if (course.getAccount() != null && buyer.getId().equals(course.getAccount().getId())) {
            throw new IllegalArgumentException(OWN_COURSE_PURCHASE_NOT_ALLOWED);
        }
        if (enrollmentRepository.existsByAccountAndCourseAndStatusIn(buyer, course, java.util.List.of(1))) {
            throw new IllegalArgumentException(ALREADY_ENROLLED);
        }
    }

    private boolean isCategoryActive(com.gnostica.core.model.Category category, java.util.Set<Integer> visitedCategoryIds) {
        if (category == null || category.getId() == null || !visitedCategoryIds.add(category.getId())) {
            return false;
        }
        if (category.getStatus() == null || category.getStatus() != 1 || category.getDeletedAt() != null) {
            return false;
        }
        return category.getParent() == null || isCategoryActive(category.getParent(), visitedCategoryIds);
    }

    private String trustedReturnUrl() {
        return publicUrl.replaceAll("/+$", "") + "/checkout";
    }

    private PaymentLinkResponse findReusablePendingPayOSPayment(Account account, Course course) {
        List<Order> pendingOrders = orderRepository.findPendingPayOSOrdersByAccountAndCourse(account, course);
        return payOSPaymentLinkCacheService.find(account.getId(), course.getId())
                .filter(link -> pendingOrders.stream().anyMatch(order -> order.getOrderCode().equals(link.getOrderCode())))
                .orElse(null);
    }

    private PaymentLinkResponse findReusablePendingVNPayPayment(Account account, Course course) throws Exception {
        LocalDateTime expiresBefore = LocalDateTime.now()
                .minusMinutes(Math.max(1, vnPayProperties.getExpireMinutes()));
        List<Order> pendingOrders = orderRepository
                .findPendingVNPayOrdersByAccountAndCourseForUpdate(account, course);

        for (Order pendingOrder : pendingOrders) {
            if (pendingOrder.getCreatedAt() == null || pendingOrder.getCreatedAt().isBefore(expiresBefore)) {
                cancelExpiredVNPayOrder(pendingOrder);
                continue;
            }
            // Generate the same VNPay transaction again, retaining its original
            // order code, create time and expiry rather than creating another order.
            return paymentService.createPaymentLink(pendingOrder, trustedReturnUrl(), trustedCancelUrl());
        }
        return null;
    }

    private void cancelExpiredVNPayOrder(Order order) {
        if (order.getStatus() != OrderStatus.PENDING) {
            return;
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        releaseReservedCoupon(order);
    }

    private void clearPendingPayOSPaymentLink(Order order) {
        if (order.getAccount() == null || order.getDetails() == null || order.getDetails().isEmpty()) {
            return;
        }
        Course course = order.getDetails().get(0).getCourse();
        if (course != null) {
            payOSPaymentLinkCacheService.clear(order.getAccount().getId(), course.getId());
        }
    }

    private String trustedCancelUrl() {
        return trustedReturnUrl() + "?cancelled=true";
    }

    private void releaseReservedCoupon(Order order) {
        Coupon coupon = order.getCoupon();
        if (coupon == null || coupon.getReservedQuantity() == null) {
            return;
        }
        coupon.setReservedQuantity(Math.max(0, coupon.getReservedQuantity() - 1));
        couponRepository.save(coupon);
    }

    private Order saveOrder(Account account, Coupon coupon, BigDecimal couponPrice, BigDecimal totalPrice, String transactionId,
            String paymentMethod) {
        Order order = new Order();
        order.setAccount(account);
        order.setCoupon(coupon);
        order.setCouponPrice(couponPrice == null ? BigDecimal.ZERO : couponPrice);
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

    private OrderDetail saveOrderDetail(Order order, Course course, BigDecimal originalCoursePrice, int courseDiscount) {
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setCourse(course);
        if (course.getAccount() != null) {
            detail.setCommission(commissionResolver.resolve(course.getAccount(), LocalDateTime.now()).source());
        }
        detail.setPrice(originalCoursePrice);
        detail.setDiscount(courseDiscount);
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
        resp.setCouponPrice(order.getCouponPrice());
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
