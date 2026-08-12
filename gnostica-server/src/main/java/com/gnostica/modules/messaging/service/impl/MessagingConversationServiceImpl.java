package com.gnostica.modules.messaging.service.impl;

import com.gnostica.core.exception.BadRequestException;
import com.gnostica.core.exception.ForbiddenException;
import com.gnostica.core.exception.ResourceNotFoundException;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Conversation;
import com.gnostica.core.model.ConversationParticipant;
import com.gnostica.core.model.enums.ParticipantRole;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.security.AuthenticatedAccountProvider;
import com.gnostica.modules.messaging.dto.response.ConversationDetailResponse;
import com.gnostica.modules.messaging.dto.response.ConversationSummaryResponse;
import com.gnostica.modules.messaging.mapper.ConversationMapper;
import com.gnostica.modules.messaging.repository.ConversationParticipantRepository;
import com.gnostica.modules.messaging.repository.ConversationRepository;
import com.gnostica.modules.messaging.repository.MessageRepository;
import com.gnostica.modules.messaging.service.MessagingConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingConversationServiceImpl implements MessagingConversationService {

    private final AuthenticatedAccountProvider authenticatedAccountProvider;
    private final CourseRepository courseRepository;
    private final AccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final ConversationMapper conversationMapper;

    @Override
    @Transactional
    public ConversationDetailResponse createOrGetForStudent(UUID courseId) {
        Account student = authenticatedAccountProvider.requireCurrentAccount();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học không tồn tại!"));

        if (course.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Khóa học không tồn tại!");
        }

        // Current course workflow uses status 1 for an admin-approved/published course.
        Integer status = course.getStatus();
        if (status == null || status != 1) {
            throw new ForbiddenException("Khóa học chưa được xuất bản để tham gia nhắn tin!");
        }

        Account instructor = course.getAccount();
        if (instructor == null) {
            throw new ResourceNotFoundException("Khóa học chưa có thông tin giảng viên!");
        }

        if (student.getId().equals(instructor.getId())) {
            throw new BadRequestException("Giảng viên không thể tự mở hội thoại nhắn tin với chính mình!");
        }

        // Verify valid enrollment (status 1 = In Progress, 2 = Completed)
        boolean hasValidEnrollment = enrollmentRepository.existsByAccountAndCourseAndStatusIn(
                student, course, List.of(1, 2));

        if (!hasValidEnrollment) {
            throw new ForbiddenException("Bạn cần đăng ký khóa học để nhắn tin với giảng viên!");
        }

        Conversation conversation = findOrCreateConversationInternal(course, student, instructor);
        return conversationMapper.toDetailResponse(conversation, student.getId());
    }

    @Override
    @Transactional
    public ConversationDetailResponse createOrGetForInstructor(UUID courseId, UUID studentId) {
        Account instructor = authenticatedAccountProvider.requireCurrentAccount();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Khóa học không tồn tại!"));

        if (course.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Khóa học không tồn tại!");
        }

        if (!course.getAccount().getId().equals(instructor.getId())) {
            throw new ForbiddenException("Chỉ giảng viên sở hữu khóa học mới có quyền thực hiện hành động này!");
        }

        Account student = accountRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Học viên không tồn tại!"));

        if (student.getStatus() == null || student.getStatus() != 1) {
            throw new ResourceNotFoundException("Học viên không tồn tại hoặc đã bị khóa!");
        }

        if (student.getId().equals(instructor.getId())) {
            throw new BadRequestException("Không thể dùng studentId trùng với instructor!");
        }

        boolean hasValidEnrollment = enrollmentRepository.existsByAccountAndCourseAndStatusIn(
                student, course, List.of(1, 2));

        if (!hasValidEnrollment) {
            throw new ForbiddenException("Học viên chưa có enrollment hợp lệ trong khóa học!");
        }

        Conversation conversation = findOrCreateConversationInternal(course, student, instructor);
        return conversationMapper.toDetailResponse(conversation, instructor.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationDetailResponse getConversation(UUID conversationId) {
        Account currentAccount = authenticatedAccountProvider.requireCurrentAccount();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuộc hội thoại không tồn tại!"));

        if (conversation.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Cuộc hội thoại không tồn tại!");
        }

        ConversationParticipant participant = participantRepository.findByConversationIdAndAccountId(conversationId, currentAccount.getId())
                .orElseThrow(() -> new ForbiddenException("Bạn không có quyền truy cập cuộc hội thoại này!"));

        // Consistency check
        if (!conversation.getStudent().getId().equals(currentAccount.getId())
                && !conversation.getInstructor().getId().equals(currentAccount.getId())) {
            throw new ForbiddenException("Dữ liệu hội thoại không nhất quán!");
        }

        return conversationMapper.toDetailResponse(conversation, currentAccount.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ConversationSummaryResponse> getMyConversations(Pageable pageable) {
        Account currentAccount = authenticatedAccountProvider.requireCurrentAccount();

        Page<Conversation> page = conversationRepository.findActiveConversationsByAccountId(currentAccount.getId(), pageable);

        return page.map(conv -> {
            Optional<ConversationParticipant> participantOpt = participantRepository.findByConversationIdAndAccountId(conv.getId(), currentAccount.getId());

            long unread;
            if (participantOpt.isPresent()) {
                ConversationParticipant participant = participantOpt.get();
                LocalDateTime lastReadAt = participant.getLastReadAt();
                UUID lastReadMsgId = participant.getLastReadMessage() != null ? participant.getLastReadMessage().getId() : null;
                unread = messageRepository.countUnreadForParticipant(conv.getId(), currentAccount.getId(), lastReadAt, lastReadMsgId);
            } else {
                log.warn("ConversationParticipant not found for conversation {} and account {}", conv.getId(), currentAccount.getId());
                unread = messageRepository.countAllUnreadMessages(conv.getId(), currentAccount.getId());
            }

            return conversationMapper.toSummaryResponse(conv, currentAccount.getId(), unread);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationParticipant requireParticipant(UUID conversationId, UUID accountId) {
        return participantRepository.findByConversationIdAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ForbiddenException("Bạn không có quyền truy cập cuộc hội thoại này!"));
    }

    private Conversation findOrCreateConversationInternal(Course course, Account student, Account instructor) {
        Optional<Conversation> existingOpt = conversationRepository.findByCourseIdAndStudentIdAndInstructorId(
                course.getId(), student.getId(), instructor.getId());

        if (existingOpt.isPresent()) {
            Conversation conv = existingOpt.get();
            if (conv.getDeletedAt() != null) {
                conv.setDeletedAt(null);
                conv = conversationRepository.save(conv);
            }
            ensureParticipantsExist(conv, student, instructor);
            return conv;
        }

        try {
            Conversation newConv = Conversation.builder()
                    .course(course)
                    .student(student)
                    .instructor(instructor)
                    .build();

            newConv = conversationRepository.saveAndFlush(newConv);

            ConversationParticipant studentParticipant = ConversationParticipant.builder()
                    .conversation(newConv)
                    .account(student)
                    .role(ParticipantRole.STUDENT)
                    .build();

            ConversationParticipant instructorParticipant = ConversationParticipant.builder()
                    .conversation(newConv)
                    .account(instructor)
                    .role(ParticipantRole.INSTRUCTOR)
                    .build();

            participantRepository.saveAllAndFlush(List.of(studentParticipant, instructorParticipant));
            return newConv;
        } catch (DataIntegrityViolationException ex) {
            // Race condition fallback: retrieve conversation created concurrently by another thread/request
            return conversationRepository.findByCourseIdAndStudentIdAndInstructorId(course.getId(), student.getId(), instructor.getId())
                    .orElseThrow(() -> ex);
        }
    }

    private void ensureParticipantsExist(Conversation conv, Account student, Account instructor) {
        boolean hasStudentParticipant = participantRepository.findByConversationIdAndAccountId(conv.getId(), student.getId()).isPresent();
        if (!hasStudentParticipant) {
            participantRepository.save(ConversationParticipant.builder()
                    .conversation(conv)
                    .account(student)
                    .role(ParticipantRole.STUDENT)
                    .build());
        }

        boolean hasInstructorParticipant = participantRepository.findByConversationIdAndAccountId(conv.getId(), instructor.getId()).isPresent();
        if (!hasInstructorParticipant) {
            participantRepository.save(ConversationParticipant.builder()
                    .conversation(conv)
                    .account(instructor)
                    .role(ParticipantRole.INSTRUCTOR)
                    .build());
        }
    }
}
