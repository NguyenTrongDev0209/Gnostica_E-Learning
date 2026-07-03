package com.gnostica.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.dto.request.CouponRequest;
import com.gnostica.dto.response.CouponResponse;
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CouponRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final AccountRepository accountRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Coupon coupon = new Coupon();
        coupon.setName(request.getName());
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountPercent(request.getDiscountPercent());
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setMinDiscount(request.getMinDiscount());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setQuantity(request.getQuantity());
        coupon.setStatus(0); // Mặc định là Tạm ẩn (0)
        coupon.setAccount(account);

        Coupon savedCoupon = couponRepository.save(coupon);

        // Publish audit log event (async)
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "target_type", "Coupon",
                    "target_id", savedCoupon.getId(),
                    "code", savedCoupon.getCode(),
                    "discount_percent", savedCoupon.getDiscountPercent()));
            eventPublisher.publishEvent(new LogEvent(this, "CREATE_COUPON", payload, account.getId()));
        } catch (Exception e) {
            log.warn("Could not publish log event for CREATE_COUPON: {}", e.getMessage());
        }

        return mapToResponse(savedCoupon);
    }

    public java.util.List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<CouponResponse> getMyCoupons() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return couponRepository.findAllByAccount(account).stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public CouponResponse updateCouponStatus(Integer id, Integer status) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        coupon.setStatus(status);
        Coupon updatedCoupon = couponRepository.save(coupon);
        return mapToResponse(updatedCoupon);
    }

    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Mã giảm giá không tồn tại");
        }
        couponRepository.deleteById(id);
    }

    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (coupon.getStatus() != 1) {
            throw new RuntimeException("Mã giảm giá chưa được kích hoạt hoặc đã hết hạn");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn");
        }

        if (coupon.getQuantity() != null && coupon.getQuantity() <= 0) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
        }

        return mapToResponse(coupon);
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .code(coupon.getCode())
                .discountPercent(coupon.getDiscountPercent())
                .maxDiscount(coupon.getMaxDiscount())
                .minDiscount(coupon.getMinDiscount())
                .startDate(coupon.getStartDate())
                .expiryDate(coupon.getExpiryDate())
                .quantity(coupon.getQuantity())
                .status(coupon.getStatus())
                .createdAt(coupon.getCreatedAt())
                .accountId(coupon.getAccount().getId())
                .accountName(coupon.getAccount().getFullName())
                .build();
    }
}
