package com.gnostica.modules.messaging.repository;

import com.gnostica.core.model.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByCourseIdAndStudentIdAndInstructorId(UUID courseId, UUID studentId, UUID instructorId);

    Optional<Conversation> findByCourseIdAndStudentId(UUID courseId, UUID studentId);

    boolean existsByCourseIdAndStudentIdAndInstructorId(UUID courseId, UUID studentId, UUID instructorId);

    @Query("SELECT c FROM Conversation c WHERE (c.student.id = :accountId OR c.instructor.id = :accountId) AND c.deletedAt IS NULL ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC, c.id DESC")
    Page<Conversation> findActiveConversationsByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT c FROM Conversation c WHERE c.course.id = :courseId AND (c.student.id = :accountId OR c.instructor.id = :accountId) AND c.deletedAt IS NULL ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC, c.id DESC")
    Page<Conversation> findActiveConversationsByCourseIdAndAccountId(@Param("courseId") UUID courseId, @Param("accountId") UUID accountId, Pageable pageable);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Conversation c WHERE c.id = :id AND c.deletedAt IS NULL")
    Optional<Conversation> findByIdWithLock(@Param("id") UUID id);
}
