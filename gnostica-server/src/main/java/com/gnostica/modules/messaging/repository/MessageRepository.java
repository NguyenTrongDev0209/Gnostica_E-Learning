package com.gnostica.modules.messaging.repository;

import com.gnostica.core.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    Optional<Message> findBySenderIdAndClientMessageId(UUID senderId, UUID clientMessageId);

    Page<Message> findByConversationIdOrderByCreatedAtDescIdDesc(UUID conversationId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC, m.id DESC")
    List<Message> findInitialCursorPage(
            @Param("conversationId") UUID conversationId,
            Pageable pageable
    );

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId AND (m.createdAt < :createdAt OR (m.createdAt = :createdAt AND m.id < :id)) AND m.deletedAt IS NULL ORDER BY m.createdAt DESC, m.id DESC")
    List<Message> findNextCursorPage(
            @Param("conversationId") UUID conversationId,
            @Param("createdAt") LocalDateTime createdAt,
            @Param("id") UUID id,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(m)
        FROM Message m
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :accountId
          AND m.deletedAt IS NULL
    """)
    long countAllUnreadMessages(
            @Param("conversationId") UUID conversationId,
            @Param("accountId") UUID accountId
    );

    @Query("""
        SELECT COUNT(m)
        FROM Message m
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :accountId
          AND m.deletedAt IS NULL
          AND (
              m.createdAt > :lastReadAt
              OR (
                  m.createdAt = :lastReadAt
                  AND m.id > :lastReadMessageId
              )
          )
    """)
    long countUnreadMessagesAfterCursor(
            @Param("conversationId") UUID conversationId,
            @Param("accountId") UUID accountId,
            @Param("lastReadAt") LocalDateTime lastReadAt,
            @Param("lastReadMessageId") UUID lastReadMessageId
    );

    default long countUnreadForParticipant(
            UUID conversationId,
            UUID accountId,
            LocalDateTime lastReadAt,
            UUID lastReadMessageId
    ) {
        if (lastReadAt == null || lastReadMessageId == null) {
            return countAllUnreadMessages(conversationId, accountId);
        }
        return countUnreadMessagesAfterCursor(conversationId, accountId, lastReadAt, lastReadMessageId);
    }

    default long countUnreadMessagesWithTuple(
            UUID conversationId,
            UUID accountId,
            LocalDateTime lastReadCreatedAt,
            UUID lastReadId
    ) {
        return countUnreadForParticipant(conversationId, accountId, lastReadCreatedAt, lastReadId);
    }

    default long countUnreadMessages(
            UUID conversationId,
            UUID accountId,
            LocalDateTime lastReadAt
    ) {
        return countUnreadForParticipant(conversationId, accountId, lastReadAt, null);
    }

    Optional<Message> findFirstByConversationIdOrderByCreatedAtDescIdDesc(UUID conversationId);
}
