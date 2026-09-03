package com.gnostica.core.repository;

import com.gnostica.core.model.Refund;
import com.gnostica.core.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {
    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.status = 2")
    java.math.BigDecimal sumTotalApprovedRefundAmount();

    long countByStatus(Integer status);

    List<Refund> findAllByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT r.createdAt, r.status, r.amount FROM Refund r WHERE r.createdAt >= :startDate")
    List<Object[]> getAdminStatsProjection(@Param("startDate") LocalDateTime startDate);

    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order", "orderDetail.course"})
    List<Refund> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order", "orderDetail.course"})
    Page<Refund> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Refund> findByAccountOrderByCreatedAtDesc(Account account);
    List<Refund> findByOrderDetail_Order_Id(UUID orderId);
    boolean existsByOrderDetailIdAndStatus(UUID orderDetailId, Integer status);
    boolean existsByOrderDetailIdAndStatusIn(UUID orderDetailId, List<Integer> statuses);
    boolean existsByRefundCode(String refundCode);

    /** Đếm số bản ghi hoàn tiền của một người từ một mốc thời gian (dùng để giới hạn số lần hoàn/tháng). */
    long countByAccountAndCreatedAtGreaterThanEqual(Account account, LocalDateTime createdAt);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Refund r WHERE r.id = :id")
    Optional<Refund> findByIdForUpdate(UUID id);

    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order", "orderDetail.course"})
    List<Refund> findByStatusOrderByCreatedAtDesc(Integer status);

    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order", "orderDetail.course"})
    Page<Refund> findByStatusOrderByCreatedAtDesc(Integer status, Pageable pageable);

    @EntityGraph(attributePaths = {"account", "orderDetail", "orderDetail.order", "orderDetail.course"})
    Page<Refund> findByStatusInOrderByCreatedAtDesc(List<Integer> statuses, Pageable pageable);

    long countByOrderDetailCourseAccountId(UUID accountId);
    long countByOrderDetailCourseAccountIdAndStatus(UUID accountId, Integer status);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    long countByOrderDetailCourseAccountIdAndCreatedAtBetween(UUID accountId, LocalDateTime startDate, LocalDateTime endDate);
}
