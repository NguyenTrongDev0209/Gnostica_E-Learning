package com.gnostica.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gnostica.model.Thread;
import java.util.List;

@Repository
public interface ThreadRepository extends JpaRepository<Thread, Integer> {
    
    @Query("SELECT t.account, SUM(t.likes) as totalLikes, COUNT(t) as threadCount FROM Thread t GROUP BY t.account ORDER BY totalLikes DESC")
    List<Object[]> findTopContributors(Pageable pageable);

    @Query("SELECT t.category.id, COUNT(t) FROM Thread t GROUP BY t.category.id")
    List<Object[]> findThreadCountsByCategory();

    List<Thread> findTop3ByCategoryIdAndIdNotOrderByLikesDesc(Integer categoryId, Integer id);

    Page<Thread> findByAccountEmailOrderByCreatedAtDesc(String email, Pageable pageable);

    @Query("SELECT COUNT(t), COALESCE(SUM(t.likes), 0) FROM Thread t WHERE t.account.email = :email")
    Object[] getUserStats(@Param("email") String email);
}
