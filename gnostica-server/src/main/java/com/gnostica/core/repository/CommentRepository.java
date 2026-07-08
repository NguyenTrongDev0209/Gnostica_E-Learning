package com.gnostica.core.repository;

import com.gnostica.core.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByThreadIdAndParentIsNullOrderByCreatedAtDesc(Integer threadId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Integer parentId);
    long countByThreadId(Integer threadId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByThreadId(Integer threadId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Comment c WHERE c.thread.id IN :threadIds AND c.parent IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByThreadIdInAndParentIsNullOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("threadIds") java.util.Collection<Integer> threadIds);
}
