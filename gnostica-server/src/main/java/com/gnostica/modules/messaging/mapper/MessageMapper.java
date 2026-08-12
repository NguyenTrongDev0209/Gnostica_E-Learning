package com.gnostica.modules.messaging.mapper;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Message;
import com.gnostica.modules.messaging.dto.response.MessageResponse;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class MessageMapper {

    public MessageResponse toResponse(Message message, UUID currentAccountId) {
        if (message == null) return null;

        Account sender = message.getSender();
        UUID senderId = sender != null ? sender.getId() : null;
        String senderName = sender != null ? sender.getFullName() : null;
        String senderAvatar = sender != null ? sender.getAvatar() : null;

        boolean mine = currentAccountId != null && currentAccountId.equals(senderId);

        String content;
        if (message.getDeletedAt() != null) {
            content = "Tin nhắn đã bị xóa";
        } else {
            content = message.getContent();
        }

        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation() != null ? message.getConversation().getId() : null)
                .senderId(senderId)
                .senderName(senderName)
                .senderAvatar(senderAvatar)
                .clientMessageId(message.getClientMessageId())
                .type(message.getType())
                .content(content)
                .createdAt(message.getCreatedAt())
                .mine(mine)
                .build();
    }
}
