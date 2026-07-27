package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Commission;
import com.gnostica.core.model.Account;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Integer> {
    List<Commission> findByAccountAndStatusOrderByValidFromDesc(Account account, Integer status);

    List<Commission> findAllByOrderByValidFromDesc();

    Optional<Commission> findFirstByStatusOrderByValidFromDesc(Integer status);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Commission c LEFT JOIN c.account a LEFT JOIN a.role r WHERE (a IS NULL OR r.name = 'ADMIN' OR r.name = 'ROLE_ADMIN') AND c.validFrom <= :now AND (c.validUntil IS NULL OR c.validUntil > :now) ORDER BY c.validFrom DESC")
    Optional<Commission> findActiveGlobalCommissionAt(
            @org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) > 0 FROM Commission c LEFT JOIN c.account a LEFT JOIN a.role r WHERE (a IS NULL OR r.name = 'ADMIN' OR r.name = 'ROLE_ADMIN') AND c.validFrom = :validFrom")
    boolean existsGlobalByValidFrom(@org.springframework.data.repository.query.Param("validFrom") java.time.LocalDateTime validFrom);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) > 0 FROM Commission c LEFT JOIN c.account a LEFT JOIN a.role r WHERE (a IS NULL OR r.name = 'ADMIN' OR r.name = 'ROLE_ADMIN') AND c.validFrom = :validFrom AND c.id <> :id")
    boolean existsGlobalByValidFromAndIdNot(@org.springframework.data.repository.query.Param("validFrom") java.time.LocalDateTime validFrom, @org.springframework.data.repository.query.Param("id") Integer id);
}
