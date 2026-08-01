package com.gnostica.modules.order.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

import com.gnostica.core.model.Coupon;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.security.CouponCodeCipher;

import lombok.RequiredArgsConstructor;

/** Converts legacy raw coupon codes to account-scoped ciphertext after Flyway adds code_hash. */
@Component
@RequiredArgsConstructor
public class CouponCodeMigrationRunner implements ApplicationRunner {

    private final CouponRepository couponRepository;
    private final CouponCodeCipher couponCodeCipher;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (Coupon coupon : couponRepository.findAllByCodeHashIsNull()) {
            String rawCode = coupon.getEncryptedCode().trim().toUpperCase(Locale.ROOT);
            String codeHash = couponCodeCipher.hash(rawCode);
            if (couponRepository.existsByCodeHashAndIdNot(codeHash, coupon.getId())) {
                throw new IllegalStateException("Duplicate coupon code found while converting seeded coupons");
            }
            coupon.setCodeHash(codeHash);
            coupon.setEncryptedCode(couponCodeCipher.encrypt(coupon.getAccount().getId(), rawCode));
        }
    }
}
