package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gnostica.model.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    boolean existsByCode(String code);

    java.util.Optional<com.gnostica.model.Coupon> findByCode(String code);

    java.util.List<com.gnostica.model.Coupon> findAllByAccount(com.gnostica.model.Account account);
}
