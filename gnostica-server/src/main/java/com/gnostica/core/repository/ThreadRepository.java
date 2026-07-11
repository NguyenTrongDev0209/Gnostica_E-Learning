package com.gnostica.core.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Thread;
import java.util.List;

import java.util.Optional;

@Repository
public interface ThreadRepository extends JpaRepository<Thread, Integer> {
    Optional<Thread> findBySlug(String slug);
    Page<Thread> findByIdIn(List<Integer> ids, Pageable pageable);
    Page<Thread> findAllByStatus(Integer status, Pageable pageable);
    List<Thread> findAllByStatusAndUpdatedAtBefore(Integer status, java.time.LocalDateTime updatedAt);
    Page<Thread> findByAccountEmailOrderByCreatedAtDesc(String email, Pageable pageable);
    Page<Thread> findByAccountEmailAndStatusOrderByCreatedAtDesc(String email, Integer status, Pageable pageable);
    List<Thread> findTop5ByStatusOrderByViewCountDesc(Integer status);
    List<Thread> findTop5ByContentContainingIgnoreCaseOrderByCreatedAtDesc(String keyword);
    List<Thread> findTop5ByTopic_IdAndStatusOrderByViewCountDesc(Integer topicId, Integer status);
    List<Thread> findTop5ByTopic_IdAndStatusAndIdNotOrderByViewCountDesc(Integer topicId, Integer status, Integer excludedId);
    long countByTopic_Id(Integer topicId);
    
    @org.springframework.data.jpa.repository.Query("SELECT t.account, COUNT(t.id) FROM Thread t WHERE t.status = 2 GROUP BY t.account ORDER BY COUNT(t.id) DESC")
    List<Object[]> findTopContributors(Pageable pageable);
}
