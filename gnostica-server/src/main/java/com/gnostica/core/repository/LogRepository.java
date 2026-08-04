package com.gnostica.core.repository;

import com.gnostica.core.model.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {
    Page<Log> findByAccountId(UUID accountId, Pageable pageable);
}
