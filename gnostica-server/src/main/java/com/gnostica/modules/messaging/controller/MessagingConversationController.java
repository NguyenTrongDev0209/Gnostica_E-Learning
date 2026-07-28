package com.gnostica.modules.messaging.controller;

import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.messaging.dto.request.CreateConversationRequest;
import com.gnostica.modules.messaging.dto.request.MarkConversationReadRequest;
import com.gnostica.modules.messaging.dto.request.SendMessageRequest;
import com.gnostica.modules.messaging.dto.response.*;
import com.gnostica.modules.messaging.service.MessagingConversationService;
import com.gnostica.modules.messaging.service.MessagingMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class MessagingConversationController {

    private final MessagingConversationService conversationService;
    private final MessagingMessageService messageService;

    @PostMapping
    public ResponseEntity<ResponseDTO<ConversationDetailResponse>> createOrGetConversation(
            @Valid @RequestBody CreateConversationRequest request) {
        ConversationDetailResponse response;
        if (request.getStudentId() != null) {
            response = conversationService.createOrGetForInstructor(request.getCourseId(), request.getStudentId());
        } else {
            response = conversationService.createOrGetForStudent(request.getCourseId());
        }
        return ResponseEntity.ok(new ResponseDTO<>(200, "Thao tác hội thoại thành công", response));
    }

    @GetMapping
    public ResponseEntity<ResponseDTO<Page<ConversationSummaryResponse>>> getMyConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int effectiveSize = Math.min(Math.max(size, 1), 100);
        Page<ConversationSummaryResponse> response = conversationService.getMyConversations(PageRequest.of(page, effectiveSize));
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", response));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ResponseDTO<ConversationDetailResponse>> getConversation(
            @PathVariable UUID conversationId) {
        ConversationDetailResponse response = conversationService.getConversation(conversationId);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", response));
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<ResponseDTO<CursorPageResponse<MessageResponse>>> getMessages(
            @PathVariable UUID conversationId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "30") int limit) {
        CursorPageResponse<MessageResponse> response = messageService.getMessages(conversationId, cursor, limit);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", response));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<ResponseDTO<MessageResponse>> sendMessage(
            @PathVariable UUID conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendTextMessage(conversationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResponseDTO<>(201, "Gửi tin nhắn thành công", response));
    }

    @PatchMapping("/{conversationId}/read")
    public ResponseEntity<ResponseDTO<ConversationReadResponse>> markAsRead(
            @PathVariable UUID conversationId,
            @Valid @RequestBody MarkConversationReadRequest request) {
        ConversationReadResponse response = messageService.markAsRead(conversationId, request.getMessageId());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Đã đánh dấu tin nhắn là đã đọc", response));
    }
}
