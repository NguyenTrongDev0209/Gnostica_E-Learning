package com.gnostica.modules.messaging.mapper;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.Message;
import com.gnostica.core.model.enums.ParticipantRole;
import com.gnostica.modules.messaging.dto.response.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ConversationMapper {

    public CourseConversationSummaryResponse toCourseSummary(Course course) {
        if (course == null) return null;
        return CourseConversationSummaryResponse.builder()
                .courseId(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .thumbnail(course.getThumbnail())
                .build();
    }

    public ParticipantSummaryResponse toParticipantSummary(Account account, ParticipantRole role) {
        if (account == null) return null;
        return ParticipantSummaryResponse.builder()
                .accountId(account.getId())
                .fullName(account.getFullName())
                .avatar(account.getAvatar())
                .role(role)
                .build();
    }

    public LastMessageSummaryResponse toLastMessageSummary(Message message) {
        if (message == null) return null;

        String preview;
        if (message.getDeletedAt() != null) {
            preview = "Tin nhắn đã bị xóa";
        } else {
            String content = message.getContent() != null ? message.getContent() : "";
            preview = content.length() > 100 ? content.substring(0, 100) + "..." : content;
        }

        return LastMessageSummaryResponse.builder()
                .messageId(message.getId())
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .type(message.getType())
                .contentPreview(preview)
                .createdAt(message.getCreatedAt())
                .build();
    }

    public ConversationDetailResponse toDetailResponse(Conversation conversation, UUID currentAccountId) {
        if (conversation == null) return null;

        ParticipantRole currentRole = null;
        if (currentAccountId != null) {
            if (conversation.getStudent() != null && currentAccountId.toString().equals(conversation.getStudent().getId().toString())) {
                currentRole = ParticipantRole.STUDENT;
            } else if (conversation.getInstructor() != null && currentAccountId.toString().equals(conversation.getInstructor().getId().toString())) {
                currentRole = ParticipantRole.INSTRUCTOR;
            }
        }

        return ConversationDetailResponse.builder()
                .id(conversation.getId())
                .course(toCourseSummary(conversation.getCourse()))
                .student(toParticipantSummary(conversation.getStudent(), ParticipantRole.STUDENT))
                .instructor(toParticipantSummary(conversation.getInstructor(), ParticipantRole.INSTRUCTOR))
                .currentParticipantRole(currentRole)
                .lastMessage(toLastMessageSummary(conversation.getLastMessage()))
                .lastMessageAt(conversation.getLastMessageAt() != null ? conversation.getLastMessageAt() : conversation.getCreatedAt())
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    public ConversationSummaryResponse toSummaryResponse(Conversation conversation, UUID currentAccountId, long unreadCount) {
        if (conversation == null) return null;

        boolean isStudent = currentAccountId != null && conversation.getStudent() != null && 
                            currentAccountId.toString().equals(conversation.getStudent().getId().toString());
        Account otherAccount = isStudent ? conversation.getInstructor() : conversation.getStudent();
        ParticipantRole otherRole = isStudent ? ParticipantRole.INSTRUCTOR : ParticipantRole.STUDENT;

        return ConversationSummaryResponse.builder()
                .id(conversation.getId())
                .course(toCourseSummary(conversation.getCourse()))
                .otherParticipant(toParticipantSummary(otherAccount, otherRole))
                .lastMessage(toLastMessageSummary(conversation.getLastMessage()))
                .lastMessageAt(conversation.getLastMessageAt() != null ? conversation.getLastMessageAt() : conversation.getCreatedAt())
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .build();
    }
}
