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
}
