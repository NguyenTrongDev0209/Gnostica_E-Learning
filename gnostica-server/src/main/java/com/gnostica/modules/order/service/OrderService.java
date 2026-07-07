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
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;
    private final PaymentService paymentService;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    public OrderResponse getOrderById(UUID id) throws Exception {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
        return mapToResponse(checkAndReturnOrder(order));
    }

    public OrderResponse getOrderByTransactionId(String transactionId) throws Exception {
        // Find order by transactionId by filtering or custom repository method.
        // If repository doesn't have it, we fallback to id search.
        Order order = orderRepository.findAll().stream()
                .filter(o -> transactionId.equals(o.getId().toString())) // Assuming transactionId might just be the order ID for now
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Order not found with Transaction ID: " + transactionId));
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

    @Transactional
    public PaymentLinkResponse createPaymentLink(CreatePaymentLinkRequestBody requestBody) throws Exception {
        String email = AuthUtil.getCurrentUserEmail();
        if (email == null) {
            throw new RuntimeException("User not authenticated");
        }

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found for email: " + email));

        Course course = courseRepository.findById(requestBody.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found for ID: " + requestBody.getCourseId()));

        long orderCode = System.currentTimeMillis();

        BigDecimal actualPrice = (requestBody.getPrice() != null) ? BigDecimal.valueOf(requestBody.getPrice()) : course.getSalePrice();
        
        Coupon appliedCoupon = null;
        if (requestBody.getCouponCode() != null && !requestBody.getCouponCode().trim().isEmpty()) {
            // Validate coupon (throws exception if invalid)
            couponService.validateCoupon(requestBody.getCouponCode());
            
            appliedCoupon = couponRepository.findByCode(requestBody.getCouponCode().toUpperCase())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
            
            // Deduct coupon quantity
            if (appliedCoupon.getQuantity() != null) {
                appliedCoupon.setQuantity(appliedCoupon.getQuantity() - 1);
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

        Order order = saveOrder(account, appliedCoupon, actualPrice, String.valueOf(orderCode));
        OrderDetail detail = saveOrderDetail(order, course, actualPrice);

        List<OrderDetail> details = new ArrayList<>();
        details.add(detail);
        order.setDetails(details);

        // If price is 0, we can bypass payment gateway
        if (actualPrice.compareTo(BigDecimal.ZERO) == 0) {
            order.setStatus(2); // PAID
            order.setPaymentMethod("FREE/COUPON");
            orderRepository.save(order);
            // Return a dummy link or custom response
            return PaymentLinkResponse.builder()
                .bin("N/A").accountNumber("N/A").accountName("FREE")
                .amount(0).description("Miễn phí")
                .orderCode(orderCode).currency("VND")
                .paymentLinkId("FREE-" + orderCode).status("PAID")
                .checkoutUrl(requestBody.getReturnUrl() + "?orderCode=" + orderCode)
                .qrCode("").build();
        }

        return paymentService.createPaymentLink(order);
    }

    private Order saveOrder(Account account, Coupon coupon, BigDecimal totalPrice, String transactionId) {
        Order order = new Order();
        order.setAccount(account);
        order.setCoupon(coupon);
        order.setTotalPrice(totalPrice);
        order.setPaymentMethod("PAYOS"); // Default
        order.setStatus(0); // 0: PENDING
        // Temporary solution to pass orderCode without modifying DB model too much.
        // We will store it in paymentMethod temporarily if transactionId doesn't exist, but since it's PayOS, we might just use ID.
        order.setCreatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private OrderDetail saveOrderDetail(Order order, Course course, BigDecimal actualPrice) {
        OrderDetail detail = new OrderDetail();
        detail.setOrder(order);
        detail.setCourse(course);
        detail.setPrice(actualPrice);
        detail.setDiscount(course.getDiscount() != null ? course.getDiscount().intValue() : 0);
        detail.setStatus(1); // 1: Valid
        return orderDetailRepository.save(detail);
    }
    
    private OrderResponse mapToResponse(Order order) {
        OrderResponse resp = new OrderResponse();
        resp.setId(order.getId());
        if (order.getAccount() != null) {
            resp.setAccountId(order.getAccount().getId());
            resp.setAccountName(order.getAccount().getFullName());
            resp.setAccountEmail(order.getAccount().getEmail());
        }
        if (order.getCoupon() != null) {
            resp.setCouponId(order.getCoupon().getId());
            resp.setCouponCode(order.getCoupon().getCode());
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
