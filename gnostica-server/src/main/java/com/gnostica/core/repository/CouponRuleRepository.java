package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.CouponRule;

@Repository
public interface CouponRuleRepository extends JpaRepository<CouponRule, Integer> {
}

