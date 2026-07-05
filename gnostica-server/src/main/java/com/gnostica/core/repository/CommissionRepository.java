package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Commission;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Integer> {
}

