package com.gnostica.modules.messaging.service.impl;

import com.gnostica.core.exception.BadRequestException;
import com.gnostica.core.exception.ForbiddenException;
import com.gnostica.core.exception.IdempotencyConflictException;
import com.gnostica.core.exception.ResourceNotFoundException;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.core.model.Message;
import com.gnostica.core.model.enums.MessageType;
import com.gnostica.modules.messaging.repository.ConversationRepository;
import com.gnostica.core.security.AuthenticatedAccountProvider;
import com.gnostica.modules.messaging.dto.request.SendMessageRequest;
import com.gnostica.modules.messaging.dto.response.ConversationReadResponse;
import com.gnostica.modules.messaging.dto.response.CursorPageResponse;
import com.gnostica.modules.messaging.dto.response.MessageCursor;
import com.gnostica.modules.messaging.dto.response.MessageResponse;
import com.gnostica.modules.messaging.mapper.MessageMapper;
import com.gnostica.modules.messaging.repository.ConversationParticipantRepository;
import com.gnostica.modules.messaging.repository.MessageRepository;
import com.gnostica.modules.messaging.service.MessagingConversationService;
import com.gnostica.modules.messaging.service.MessagingMessageService;
import com.gnostica.modules.messaging.util.MessageCursorUtils;
import com.gnostica.modules.messaging.event.domain.ConversationReadDomainEvent;
import com.gnostica.modules.messaging.event.domain.MessageCreatedDomainEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagingMessageServiceImpl implements MessagingMessageService {

    private final AuthenticatedAccountProvider authenticatedAccountProvider;
    private final MessagingConversationService conversationService;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public MessageResponse sendTextMessage(UUID conversationId, SendMessageRequest request) {
        Account sender = authenticatedAccountProvider.requireCurrentAccount();

        if (request == null || request.getClientMessageId() == null) {
            throw new BadRequestException("clientMessageId không được để trống!");
        }

        String rawContent = request.getContent();
        if (rawContent == null || rawContent.trim().isEmpty()) {
            throw new BadRequestException("Nội dung tin nhắn không được để trống!");
        }

        String content = rawContent.trim();
        if (content.length() > 5000) {
            throw new BadRequestException("Nội dung tin nhắn không được vượt quá 5000 ký tự!");
        }

        // Lock conversation with PESSIMISTIC_WRITE to prevent concurrent lastMessage update races
        Conversation conversation = conversationRepository.findByIdWithLock(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuộc hội thoại không tồn tại!"));

        if (conversation.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Cuộc hội thoại không tồn tại!");
        }

        // Validate sender is a participant of this conversation
        conversationService.requireParticipant(conversationId, sender.getId());

        // Idempotency check via (senderId, clientMessageId)
        Optional<Message> existingOpt = messageRepository.findBySenderIdAndClientMessageId(sender.getId(), request.getClientMessageId());

        if (existingOpt.isPresent()) {
            Message existing = existingOpt.get();

            boolean sameConversation = existing.getConversation().getId().equals(conversationId);
            boolean sameContent = existing.getContent().equals(content);

            if (sameConversation && sameContent) {
                return messageMapper.toResponse(existing, sender.getId());
            } else {
                throw new IdempotencyConflictException("clientMessageId đã được sử dụng với nội dung hoặc hội thoại khác!");
            }
        }

        // MVP only supports MessageType.TEXT
        MessageType type = MessageType.TEXT;

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .clientMessageId(request.getClientMessageId())
                .content(content)
                .type(type)
                .build();

        Message savedMessage = messageRepository.saveAndFlush(message);

        // Update conversation lastMessage & lastMessageAt atomically in same transaction
        conversation.setLastMessage(savedMessage);
        conversation.setLastMessageText(savedMessage.getContent().length() > 1000
                ? savedMessage.getContent().substring(0, 1000)
                : savedMessage.getContent());
        conversation.setLastMessageAt(savedMessage.getCreatedAt());

        conversationRepository.save(conversation);

        // Publish Spring Domain Event (listened AFTER_COMMIT to broadcast STOMP realtime event)
        eventPublisher.publishEvent(MessageCreatedDomainEvent.builder()
                .conversationId(conversation.getId())
                .messageId(savedMessage.getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .senderAvatar(sender.getAvatar())
                .clientMessageId(savedMessage.getClientMessageId())
                .type(savedMessage.getType())
                .content(savedMessage.getContent())
                .createdAt(savedMessage.getCreatedAt())
                .studentAccountId(conversation.getStudent() != null ? conversation.getStudent().getId() : null)
                .studentEmail(conversation.getStudent() != null ? conversation.getStudent().getEmail() : null)
                .instructorAccountId(conversation.getInstructor() != null ? conversation.getInstructor().getId() : null)
                .instructorEmail(conversation.getInstructor() != null ? conversation.getInstructor().getEmail() : null)
                .createdNew(true)
                .build());

        return messageMapper.toResponse(savedMessage, sender.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public CursorPageResponse<MessageResponse> getMessages(UUID conversationId, String cursorString, int limit) {
        Account currentAccount = authenticatedAccountProvider.requireCurrentAccount();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuộc hội thoại không tồn tại!"));

        if (conversation.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Cuộc hội thoại không tồn tại!");
        }

        conversationService.requireParticipant(conversationId, currentAccount.getId());

        int effectiveLimit = Math.min(Math.max(limit, 1), 100);
        MessageCursor cursor = MessageCursorUtils.decode(cursorString);

        List<Message> rawList;
        if (cursor == null) {
            rawList = messageRepository.findInitialCursorPage(conversationId, PageRequest.of(0, effectiveLimit + 1));
        } else {
            rawList = messageRepository.findNextCursorPage(
                    conversationId,
                    cursor.getCreatedAt(),
                    cursor.getMessageId(),
                    PageRequest.of(0, effectiveLimit + 1)
            );
        }

        boolean hasNext = rawList.size() > effectiveLimit;
        List<Message> pageItems = hasNext ? new ArrayList<>(rawList.subList(0, effectiveLimit)) : new ArrayList<>(rawList);

        String nextCursor = null;
        if (hasNext && !pageItems.isEmpty()) {
            Message oldestInBatch = pageItems.get(pageItems.size() - 1);
            nextCursor = MessageCursorUtils.encode(oldestInBatch.getCreatedAt(), oldestInBatch.getId());
        }

        // Reverse items to return chronological ASC order for UI rendering convenience
        Collections.reverse(pageItems);

        List<MessageResponse> itemResponses = pageItems.stream()
                .map(m -> messageMapper.toResponse(m, currentAccount.getId()))
                .collect(Collectors.toList());

        return CursorPageResponse.<MessageResponse>builder()
                .items(itemResponses)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .build();
    }

    @Override
    @Transactional
    public ConversationReadResponse markAsRead(UUID conversationId, UUID messageId) {
        Account currentAccount = authenticatedAccountProvider.requireCurrentAccount();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuộc hội thoại không tồn tại!"));

        if (conversation.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Cuộc hội thoại không tồn tại!");
        }

        ConversationParticipant participant = conversationService.requireParticipant(conversationId, currentAccount.getId());

        Message targetMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Tin nhắn không tồn tại!"));

        if (targetMessage.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Tin nhắn không tồn tại!");
        }

        if (!targetMessage.getConversation().getId().equals(conversationId)) {
            throw new BadRequestException("Tin nhắn không thuộc cuộc hội thoại này!");
        }

        Message lastRead = participant.getLastReadMessage();
        boolean shouldUpdateReadCursor = false;

        if (lastRead == null) {
            shouldUpdateReadCursor = true;
        } else {
            // Compare (createdAt, id) tuple to prevent moving read cursor backwards
            if (targetMessage.getCreatedAt().isAfter(lastRead.getCreatedAt())) {
                shouldUpdateReadCursor = true;
            } else if (targetMessage.getCreatedAt().isEqual(lastRead.getCreatedAt())
                    && targetMessage.getId().compareTo(lastRead.getId()) > 0) {
                shouldUpdateReadCursor = true;
            }
        }

        if (shouldUpdateReadCursor) {
            participant.setLastReadMessage(targetMessage);
            participant.setLastReadAt(targetMessage.getCreatedAt());
            participantRepository.save(participant);

            Account otherAccount = conversation.getStudent() != null && conversation.getStudent().getId().equals(currentAccount.getId())
                    ? conversation.getInstructor()
                    : conversation.getStudent();

            eventPublisher.publishEvent(ConversationReadDomainEvent.builder()
                    .conversationId(conversationId)
                    .readerAccountId(currentAccount.getId())
                    .readerEmail(currentAccount.getEmail())
                    .otherAccountId(otherAccount != null ? otherAccount.getId() : null)
                    .otherEmail(otherAccount != null ? otherAccount.getEmail() : null)
                    .lastReadMessageId(targetMessage.getId())
                    .lastReadAt(targetMessage.getCreatedAt())
                    .build());
        }

        Message currentLastReadMessage = participant.getLastReadMessage();
        UUID lastReadMsgId = currentLastReadMessage != null ? currentLastReadMessage.getId() : null;

        long unreadCount = messageRepository.countUnreadForParticipant(
                conversationId,
                currentAccount.getId(),
                participant.getLastReadAt(),
                lastReadMsgId
        );

        return ConversationReadResponse.builder()
                .conversationId(conversationId)
                .accountId(currentAccount.getId())
                .lastReadMessageId(lastReadMsgId)
                .lastReadAt(participant.getLastReadAt())
                .unreadCount(unreadCount)
                .build();
    }
}
