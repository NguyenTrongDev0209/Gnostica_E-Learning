package com.gnostica.modules.messaging.service;

import com.gnostica.modules.messaging.dto.request.SendMessageRequest;
import com.gnostica.modules.messaging.dto.response.ConversationReadResponse;
import com.gnostica.modules.messaging.dto.response.CursorPageResponse;
import com.gnostica.modules.messaging.dto.response.MessageResponse;

import java.util.UUID;

public interface MessagingMessageService {

    MessageResponse sendTextMessage(UUID conversationId, SendMessageRequest request);

    CursorPageResponse<MessageResponse> getMessages(UUID conversationId, String cursor, int limit);

    ConversationReadResponse markAsRead(UUID conversationId, UUID messageId);
}
