package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gnostica.model.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Integer>{
    boolean existsByCode(String code);
}
