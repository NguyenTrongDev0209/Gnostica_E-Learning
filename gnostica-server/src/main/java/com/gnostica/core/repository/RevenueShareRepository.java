package com.gnostica.core.repository;

import com.gnostica.core.model.OrderDetail;
import com.gnostica.core.model.RevenueShare;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevenueShareRepository extends JpaRepository<RevenueShare, Integer> {
    boolean existsByOrderDetail(OrderDetail orderDetail);
}
