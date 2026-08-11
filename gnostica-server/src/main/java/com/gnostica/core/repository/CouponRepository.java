package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Coupon;
import java.util.UUID;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select c from Coupon c where c.id = :id and c.deletedAt is null")
    java.util.Optional<Coupon> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
    boolean existsByCodeHash(String codeHash);

    boolean existsByCodeHashAndIdNot(String codeHash, UUID id);

    boolean existsByEncryptedCodeIgnoreCase(String rawCode);

    boolean existsByEncryptedCodeIgnoreCaseAndIdNot(String rawCode, UUID id);

    java.util.Optional<Coupon> findByCodeHashAndDeletedAtIsNull(String codeHash);

    java.util.Optional<Coupon> findByEncryptedCodeIgnoreCaseAndDeletedAtIsNull(String rawCode);

    java.util.Optional<Coupon> findByIdAndDeletedAtIsNull(UUID id);

    java.util.List<Coupon> findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(Account account);

    java.util.List<Coupon> findAllByDeletedAtIsNullOrderByCreatedAtDesc();

    java.util.List<Coupon> findAllByCodeHashIsNull();
}
