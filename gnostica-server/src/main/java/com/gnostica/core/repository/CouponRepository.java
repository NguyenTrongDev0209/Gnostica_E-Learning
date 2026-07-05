package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gnostica.core.model.Coupon;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    boolean existsByCode(String code);

    java.util.Optional<com.gnostica.core.model.Coupon> findByCode(String code);

    java.util.List<com.gnostica.core.model.Coupon> findAllByAccount(com.gnostica.core.model.Account account);
}
