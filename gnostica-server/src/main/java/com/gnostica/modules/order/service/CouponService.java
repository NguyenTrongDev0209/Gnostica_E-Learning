package com.gnostica.modules.order.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.modules.order.dto.request.CouponRequest;
import com.gnostica.modules.order.dto.response.CouponResponse;
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.util.AuthUtil;

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
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }

        String email = AuthUtil.getCurrentUserEmail();
        if (email == null) throw new RuntimeException("User not authenticated");
        
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Coupon coupon = new Coupon();
        coupon.setName(request.getName());
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountType(request.getDiscountType() != null ? request.getDiscountType() : 1);
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setMinDiscount(request.getMinDiscount());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setQuantity(request.getQuantity());
        coupon.setStatus(request.getStatus() != null ? request.getStatus() : 0); // 0: Inactive
        coupon.setAccount(account);

        Coupon savedCoupon = couponRepository.save(coupon);

        // Publish audit log event (async)
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "target_type", "Coupon",
                    "target_id", savedCoupon.getId().toString(),
                    "code", savedCoupon.getCode(),
                    "discount_value", savedCoupon.getDiscountValue()));
            eventPublisher.publishEvent(new LogEvent(this, "CREATE_COUPON", payload, account.getId()));
        } catch (Exception e) {
            log.warn("Could not publish log event for CREATE_COUPON: {}", e.getMessage());
        }

        return mapToResponse(savedCoupon);
    }

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CouponResponse> getMyCoupons() {
        String email = AuthUtil.getCurrentUserEmail();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        return couponRepository.findAllByAccount(account).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse updateCouponStatus(UUID id, Integer status) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        coupon.setStatus(status);
        Coupon updatedCoupon = couponRepository.save(coupon);
        return mapToResponse(updatedCoupon);
    }

    public void deleteCoupon(UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Mã giảm giá không tồn tại");
        }
        couponRepository.deleteById(id);
    }

    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

        if (coupon.getStatus() != 1) { // 1: Active
            throw new RuntimeException("Mã giảm giá chưa được kích hoạt hoặc đã hết hạn");
        }

        if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn");
        }
        
        if (coupon.getValidFrom() != null && coupon.getValidFrom().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Mã giảm giá chưa đến thời gian sử dụng");
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
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .maxDiscount(coupon.getMaxDiscount())
                .minDiscount(coupon.getMinDiscount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .quantity(coupon.getQuantity())
                .status(coupon.getStatus())
                .createdAt(coupon.getCreatedAt())
                .accountId(coupon.getAccount().getId())
                .accountName(coupon.getAccount().getFullName())
                .build();
    }
}
