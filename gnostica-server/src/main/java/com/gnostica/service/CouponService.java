package com.gnostica.service;

import java.time.LocalDateTime;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.gnostica.dto.CouponRequest;
import com.gnostica.dto.CouponResponse;
import com.gnostica.model.Account;
import com.gnostica.model.Coupon;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final AccountRepository accountRepository;

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

    public void deleteCoupon(Integer id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Mã giảm giá không tồn tại");
        }
        couponRepository.deleteById(id);
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
