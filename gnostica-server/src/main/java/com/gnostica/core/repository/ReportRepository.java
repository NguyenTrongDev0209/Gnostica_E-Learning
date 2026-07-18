package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {
    void deleteByTargetIdAndTargetType(String targetId, String targetType);
}

