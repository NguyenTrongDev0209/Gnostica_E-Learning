package com.gnostica.modules.messaging.repository;

import com.gnostica.core.model.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {

    Optional<ConversationParticipant> findByConversationIdAndAccountId(UUID conversationId, UUID accountId);

    List<ConversationParticipant> findByConversationId(UUID conversationId);

    List<ConversationParticipant> findByAccountId(UUID accountId);

    @Query("SELECT cp FROM ConversationParticipant cp WHERE cp.conversation.id = :conversationId AND cp.account.id <> :accountId")
    Optional<ConversationParticipant> findOtherParticipant(@Param("conversationId") UUID conversationId, @Param("accountId") UUID accountId);
}
