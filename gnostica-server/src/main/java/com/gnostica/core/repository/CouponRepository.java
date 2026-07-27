package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    boolean existsByCodeHash(String codeHash);

    boolean existsByCodeHashAndIdNot(String codeHash, UUID id);

    java.util.Optional<Coupon> findByCodeHashAndDeletedAtIsNull(String codeHash);

    java.util.Optional<Coupon> findByIdAndDeletedAtIsNull(UUID id);

    java.util.List<Coupon> findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(Account account);

    java.util.List<Coupon> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    java.util.List<Coupon> findAllByCodeHashIsNull();
}
