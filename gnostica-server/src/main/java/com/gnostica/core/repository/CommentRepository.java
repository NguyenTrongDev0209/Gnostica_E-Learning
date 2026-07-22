package com.gnostica.core.repository;

import com.gnostica.core.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByTargetTypeAndTargetIdAndParentIsNullOrderByCreatedAtDesc(String targetType, String targetId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Integer parentId);
    long countByTargetTypeAndTargetId(String targetType, String targetId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByTargetTypeAndTargetId(String targetType, String targetId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Comment c WHERE c.targetType = :targetType AND c.targetId IN :targetIds AND c.parent IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByTargetTypeAndTargetIdInAndParentIsNullOrderByCreatedAtDesc(
            @org.springframework.data.repository.query.Param("targetType") String targetType,
            @org.springframework.data.repository.query.Param("targetIds") java.util.Collection<String> targetIds);
}
