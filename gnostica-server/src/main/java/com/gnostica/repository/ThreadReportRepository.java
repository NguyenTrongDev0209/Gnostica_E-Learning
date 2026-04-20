package com.gnostica.repository;

import com.gnostica.model.ThreadReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThreadReportRepository extends JpaRepository<ThreadReport, Integer> {
    Page<ThreadReport> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByThreadId(Integer threadId);

    boolean existsByThreadIdAndReporterEmail(Integer threadId, String email);
}
