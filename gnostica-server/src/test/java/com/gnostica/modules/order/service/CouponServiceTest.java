package com.gnostica.modules.order.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.constant.CouponStatus;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CategoryRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.modules.order.dto.request.CouponRequest;
import com.gnostica.modules.order.dto.response.CouponResponse;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    private static final String OWNER_EMAIL = "owner@example.com";

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CouponService couponService;

    private Account owner;

    @BeforeEach
    void setUp() {
        couponService = new CouponService(couponRepository, accountRepository, courseRepository, categoryRepository,
                eventPublisher, new ObjectMapper());
        owner = account(OWNER_EMAIL);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(OWNER_EMAIL, null, Collections.emptyList()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createCouponAssignsTheAuthenticatedAccountAndNormalizesTheCode() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        when(couponRepository.existsByCode("WELCOME_2026")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon coupon = invocation.getArgument(0);
            coupon.setId(UUID.randomUUID());
            return coupon;
        });

        CouponResponse response = couponService.createCoupon(request("welcome_2026"));

        ArgumentCaptor<Coupon> couponCaptor = ArgumentCaptor.forClass(Coupon.class);
        verify(couponRepository).save(couponCaptor.capture());
        Coupon savedCoupon = couponCaptor.getValue();
        assertEquals(owner, savedCoupon.getAccount());
        assertEquals("WELCOME_2026", savedCoupon.getCode());
        assertEquals(CouponStatus.INACTIVE, savedCoupon.getStatus());
        assertEquals(owner.getId(), response.getAccountId());
    }

    @Test
    void getMyCouponsReturnsOnlyCouponsOwnedByTheCurrentAccount() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        Coupon coupon = coupon(owner, "MINE");
        when(couponRepository.findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(owner))
                .thenReturn(List.of(coupon));

        List<CouponResponse> result = couponService.getMyCoupons();

        assertEquals(1, result.size());
        assertEquals("MINE", result.get(0).getCode());
        verify(couponRepository).findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(owner);
    }

    @Test
    void updateCouponRejectsCouponOwnedByAnotherAccount() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        Coupon anotherUsersCoupon = coupon(account("other@example.com"), "NOT_MINE");
        when(couponRepository.findByIdAndDeletedAtIsNull(anotherUsersCoupon.getId()))
                .thenReturn(Optional.of(anotherUsersCoupon));

        assertThrows(AccessDeniedException.class,
                () -> couponService.updateCoupon(anotherUsersCoupon.getId(), request("updated")));
    }

    @Test
    void deleteCouponSoftDeletesCouponOwnedByTheCurrentAccount() {
        when(accountRepository.findByEmail(OWNER_EMAIL)).thenReturn(Optional.of(owner));
        Coupon coupon = coupon(owner, "DELETE_ME");
        when(couponRepository.findByIdAndDeletedAtIsNull(coupon.getId())).thenReturn(Optional.of(coupon));
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> invocation.getArgument(0));

        couponService.deleteCoupon(coupon.getId());

        assertNotNull(coupon.getDeletedAt());
        verify(couponRepository).save(coupon);
    }

    @Test
    void updateCouponStatusRejectsUnsupportedStatus() {
        assertThrows(IllegalArgumentException.class,
                () -> couponService.updateCouponStatus(UUID.randomUUID(), 99));
    }

    @Test
    void requestValidationRejectsPercentageGreaterThanOneHundred() {
        CouponRequest invalidRequest = request("TOO_HIGH");
        invalidRequest.setDiscountValue(BigDecimal.valueOf(101));
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        assertFalse(validator.validate(invalidRequest).isEmpty());
    }

    private CouponRequest request(String code) {
        LocalDateTime now = LocalDateTime.now().withNano(0);
        return CouponRequest.builder()
                .name("Summer campaign")
                .code(code)
                .discountType(1)
                .discountValue(BigDecimal.TEN)
                .minDiscount(BigDecimal.ZERO)
                .maxDiscount(BigDecimal.valueOf(100_000))
                .validFrom(now)
                .validUntil(now.plusDays(7))
                .quantity(20)
                .build();
    }

    private Account account(String email) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setEmail(email);
        account.setFullName(email);
        return account;
    }

    private Coupon coupon(Account account, String code) {
        Coupon coupon = new Coupon();
        coupon.setId(UUID.randomUUID());
        coupon.setAccount(account);
        coupon.setName("Coupon " + code);
        coupon.setCode(code);
        coupon.setDiscountType(1);
        coupon.setDiscountValue(BigDecimal.TEN);
        coupon.setMinDiscount(BigDecimal.ZERO);
        coupon.setMaxDiscount(BigDecimal.valueOf(100_000));
        coupon.setQuantity(20);
        coupon.setValidFrom(LocalDateTime.now().minusDays(1));
        coupon.setValidUntil(LocalDateTime.now().plusDays(7));
        coupon.setStatus(CouponStatus.ACTIVE);
        return coupon;
    }
}
