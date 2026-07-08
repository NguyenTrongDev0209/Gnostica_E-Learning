package com.gnostica.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Thread;
import java.util.List;

@Repository
public interface ThreadRepository extends JpaRepository<Thread, Integer> {
    Page<Thread> findAllByStatus(Integer status, Pageable pageable);
    Page<Thread> findByAccountEmailOrderByCreatedAtDesc(String email, Pageable pageable);
    List<Thread> findTop5ByStatusOrderByViewCountDesc(Integer status);
    List<Thread> findTop5ByContentContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);
    List<Thread> findTop5ByTopic_IdAndStatusOrderByViewCountDesc(Integer topicId, Integer status);
    
    @org.springframework.data.jpa.repository.Query("SELECT t.account, COUNT(t.id) FROM Thread t GROUP BY t.account ORDER BY COUNT(t.id) DESC")
    List<Object[]> findTopContributors(Pageable pageable);
}
