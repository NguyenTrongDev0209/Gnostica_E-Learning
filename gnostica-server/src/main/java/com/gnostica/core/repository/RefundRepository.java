package com.gnostica.core.repository;

import com.gnostica.core.model.Refund;
import com.gnostica.core.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {
    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order"})
    List<Refund> findAllByOrderByCreatedAtDesc();

    List<Refund> findByAccountOrderByCreatedAtDesc(Account account);
    List<Refund> findByOrderDetail_Order_Id(UUID orderId);
    boolean existsByOrderDetailIdAndStatus(UUID orderDetailId, Integer status);
}
