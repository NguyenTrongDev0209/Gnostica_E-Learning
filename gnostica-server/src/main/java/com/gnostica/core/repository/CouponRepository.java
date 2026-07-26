package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, UUID id);

    java.util.Optional<Coupon> findByCodeAndDeletedAtIsNull(String code);

    java.util.Optional<Coupon> findByIdAndDeletedAtIsNull(UUID id);

    java.util.List<Coupon> findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(Account account);
}
