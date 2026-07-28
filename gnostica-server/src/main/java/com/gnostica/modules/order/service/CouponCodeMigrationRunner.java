package com.gnostica.modules.order.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
            String rawCode = coupon.getEncryptedCode();
            coupon.setCodeHash(couponCodeCipher.hash(rawCode));
            coupon.setEncryptedCode(couponCodeCipher.encrypt(coupon.getAccount().getId(), rawCode));
        }
    }
}
