package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Commission;
import com.gnostica.core.model.Account;
import java.util.List;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Integer> {
    List<Commission> findByAccountAndStatusOrderByValidFromDesc(Account account, Integer status);
}

