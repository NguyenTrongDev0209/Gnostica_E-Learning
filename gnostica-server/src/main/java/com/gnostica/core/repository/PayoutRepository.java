package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Payout;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Integer> {
}
