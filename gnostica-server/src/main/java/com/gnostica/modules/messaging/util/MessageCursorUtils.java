package com.gnostica.modules.messaging.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.gnostica.core.exception.BadRequestException;
import com.gnostica.modules.messaging.dto.response.MessageCursor;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

public class MessageCursorUtils {

    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JavaTimeModule());

    public static String encode(LocalDateTime createdAt, UUID messageId) {
        if (createdAt == null || messageId == null) {
            return null;
        }
        try {
            MessageCursor cursor = new MessageCursor(createdAt, messageId);
            String json = MAPPER.writeValueAsString(cursor);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new BadRequestException("Không thể tạo mã cursor!");
        }
    }

    public static MessageCursor decode(String cursorString) {
        if (cursorString == null || cursorString.isBlank()) {
            return null;
        }
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(cursorString);
            String json = new String(bytes, StandardCharsets.UTF_8);
            MessageCursor cursor = MAPPER.readValue(json, MessageCursor.class);
            if (cursor.getCreatedAt() == null || cursor.getMessageId() == null) {
                throw new BadRequestException("Con trỏ cursor không hợp lệ!");
            }
            return cursor;
        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception e) {
            throw new BadRequestException("Con trỏ cursor không hợp lệ!");
        }
    }
}
