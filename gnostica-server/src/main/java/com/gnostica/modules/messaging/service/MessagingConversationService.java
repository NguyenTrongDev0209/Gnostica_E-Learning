package com.gnostica.modules.messaging.service;

import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.modules.messaging.dto.response.ConversationDetailResponse;
import com.gnostica.modules.messaging.dto.response.ConversationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface MessagingConversationService {

    ConversationDetailResponse createOrGetForStudent(UUID courseId);

    ConversationDetailResponse createOrGetForInstructor(UUID courseId, UUID studentId);

    ConversationDetailResponse getConversation(UUID conversationId);

    Page<ConversationSummaryResponse> getMyConversations(Pageable pageable);

    ConversationParticipant requireParticipant(UUID conversationId, UUID accountId);
}
