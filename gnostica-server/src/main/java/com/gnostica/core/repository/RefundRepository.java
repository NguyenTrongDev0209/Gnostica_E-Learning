package com.gnostica.core.repository;

import com.gnostica.core.model.Refund;
import com.gnostica.core.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {
    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order"})
    List<Refund> findAllByOrderByCreatedAtDesc();

    List<Refund> findByAccountOrderByCreatedAtDesc(Account account);
    List<Refund> findByOrderDetail_Order_Id(UUID orderId);
    boolean existsByOrderDetailIdAndStatus(UUID orderDetailId, Integer status);
    boolean existsByOrderDetailIdAndStatusIn(UUID orderDetailId, List<Integer> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Refund r WHERE r.id = :id")
    Optional<Refund> findByIdForUpdate(UUID id);

    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order"})
    List<Refund> findByStatusOrderByCreatedAtDesc(Integer status);
}
