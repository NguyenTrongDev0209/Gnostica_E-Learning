package com.gnostica.modules.order.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.constant.CouponStatus;
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.util.AuthUtil;
import com.gnostica.modules.order.dto.request.CouponRequest;
import com.gnostica.modules.order.dto.response.CouponResponse;

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

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String code = normalizeCode(request.getCode());
        if (couponRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        Account account = getCurrentAccount();
        Coupon coupon = new Coupon();
        applyRequest(coupon, request, code);
        coupon.setStatus(request.getStatus() == null ? CouponStatus.INACTIVE : request.getStatus());
        coupon.setAccount(account);

        Coupon savedCoupon = couponRepository.save(coupon);
        publishAuditLog("CREATE_COUPON", savedCoupon, account);
        return mapToResponse(savedCoupon);
    }

    /**
     * Kept for backward compatibility with the existing web client. Results are
     * intentionally restricted to the authenticated account.
     */
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return getMyCoupons();
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getMyCoupons() {
        return couponRepository.findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(getCurrentAccount()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(UUID id) {
        return mapToResponse(getOwnedCoupon(id));
    }

    @Transactional
    public CouponResponse updateCoupon(UUID id, CouponRequest request) {
        Coupon coupon = getOwnedCoupon(id);
        String code = normalizeCode(request.getCode());
        if (couponRepository.existsByCodeAndIdNot(code, id)) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        applyRequest(coupon, request, code);
        if (request.getStatus() != null) {
            coupon.setStatus(request.getStatus());
        }

        Coupon updatedCoupon = couponRepository.save(coupon);
        publishAuditLog("UPDATE_COUPON", updatedCoupon, getCurrentAccount());
        return mapToResponse(updatedCoupon);
    }

    @Transactional
    public CouponResponse updateCouponStatus(UUID id, Integer status) {
        if (!CouponStatus.isSupported(status)) {
            throw new IllegalArgumentException("Coupon status is invalid");
        }

        Coupon coupon = getOwnedCoupon(id);
        coupon.setStatus(status);
        Coupon updatedCoupon = couponRepository.save(coupon);
        publishAuditLog("UPDATE_COUPON_STATUS", updatedCoupon, getCurrentAccount());
        return mapToResponse(updatedCoupon);
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        Coupon coupon = getOwnedCoupon(id);
        coupon.setDeletedAt(LocalDateTime.now());
        couponRepository.save(coupon);
        publishAuditLog("DELETE_COUPON", coupon, getCurrentAccount());
    }

    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCodeAndDeletedAtIsNull(normalizeCode(code))
                .orElseThrow(() -> new IllegalArgumentException("Coupon does not exist"));

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new IllegalArgumentException("Coupon is inactive or expired");
        }
        if (coupon.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon has expired");
        }
        if (coupon.getValidFrom().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon is not active yet");
        }
        if (coupon.getQuantity() <= 0) {
            throw new IllegalArgumentException("Coupon has no remaining uses");
        }

        return mapToResponse(coupon);
    }

    private Account getCurrentAccount() {
        String email = AuthUtil.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Authentication is required");
        }
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Current account does not exist"));
    }

    private Coupon getOwnedCoupon(UUID id) {
        Coupon coupon = couponRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon does not exist"));
        Account account = getCurrentAccount();
        if (!coupon.getAccount().getId().equals(account.getId())) {
            throw new AccessDeniedException("Coupon belongs to another account");
        }
        return coupon;
    }

    private void applyRequest(Coupon coupon, CouponRequest request, String code) {
        coupon.setName(request.getName().trim());
        coupon.setCode(code);
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setMinDiscount(request.getMinDiscount());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setQuantity(request.getQuantity());
        coupon.setMetadata(request.getMetadata());
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private void publishAuditLog(String action, Coupon coupon, Account account) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "target_type", "Coupon",
                    "target_id", coupon.getId().toString(),
                    "code", coupon.getCode(),
                    "discount_value", coupon.getDiscountValue()));
            eventPublisher.publishEvent(new LogEvent(this, action, payload, account.getId()));
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            log.warn("Could not publish log event for {}: {}", action, exception.getMessage());
        }
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
                .metadata(coupon.getMetadata())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .accountId(coupon.getAccount().getId())
                .accountName(coupon.getAccount().getFullName())
                .build();
    }
}
