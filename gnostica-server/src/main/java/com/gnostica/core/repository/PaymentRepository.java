package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, java.util.UUID> {
}

