package com.gnostica.repository;

import com.gnostica.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Integer> {
    List<Comment> findByObjectIdAndParentIsNullOrderByCreatedAtDesc(String objectId);
    List<Comment> findByParentIdOrderByCreatedAtAsc(Integer parentId);
    long countByObjectId(String objectId);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByObjectId(String objectId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Comment c WHERE c.objectId IN :objectIds AND c.parent IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByObjectIdInAndParentIsNullOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("objectIds") java.util.Collection<String> objectIds);
}
