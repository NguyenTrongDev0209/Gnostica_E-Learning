package com.gnostica.modules.forum.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Comment;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Lesson;
import com.gnostica.core.model.Thread;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.LessonRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.modules.forum.service.CommentService;
import com.gnostica.modules.user.service.NotificationService;
import com.gnostica.core.exception.ForbiddenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    public List<Comment> getCommentsByThreadId(Integer threadId) {
        return getCommentsByTarget("THREAD", threadId.toString());
    }

    @Override
    public List<Comment> getCommentsByTarget(String targetType, String targetId) {
        return commentRepository.findByTargetTypeAndTargetIdAndParentIsNullOrderByCreatedAtDesc(
                normalizeTargetType(targetType),
                normalizeTargetId(targetId));
    }

    @Override
    public List<Comment> getCommentsByTarget(String targetType, String targetId, String userEmail) {
        String normalizedTargetType = normalizeTargetType(targetType);
        String normalizedTargetId = normalizeTargetId(targetId);

        if ("LESSON".equals(normalizedTargetType)) {
            if (userEmail == null || userEmail.isBlank()) {
                throw new RuntimeException("User email is required");
            }
            Account account = accountRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            Lesson lesson = lessonRepository.findById(Integer.parseInt(normalizedTargetId))
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            ensureLessonCommentAccess(account, lesson);
        }

        return commentRepository.findByTargetTypeAndTargetIdAndParentIsNullOrderByCreatedAtDesc(
                normalizedTargetType,
                normalizedTargetId);
    }

    @Override
    @Transactional
    public Comment addComment(String content, Integer threadId, String userEmail, Integer parentId) {
        return addComment(content, "THREAD", threadId != null ? threadId.toString() : null, userEmail, parentId);
    }

    @Override
    @Transactional
    public Comment addComment(String content, String targetType, String targetId, String userEmail, Integer parentId) {
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        String normalizedTargetType = normalizeTargetType(targetType);
        String normalizedTargetId = normalizeTargetId(targetId);

        if ("THREAD".equals(normalizedTargetType)) {
            threadRepository.findById(Integer.parseInt(normalizedTargetId))
                    .orElseThrow(() -> new RuntimeException("Thread not found"));
        } else if ("LESSON".equals(normalizedTargetType)) {
            Lesson lesson = lessonRepository.findById(Integer.parseInt(normalizedTargetId))
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
            ensureLessonCommentAccess(account, lesson);
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTargetType(normalizedTargetType);
        comment.setTargetId(normalizedTargetId);
        comment.setAccount(account);
        comment.setStatus(1);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            if (!normalizedTargetType.equals(parent.getTargetType()) || !normalizedTargetId.equals(parent.getTargetId())) {
                throw new RuntimeException("Parent comment does not belong to the same target");
            }
            comment.setParent(parent);
            
            // Notification logic
            if (parent.getAccount() != null && !parent.getAccount().getEmail().equals(userEmail)) {
                String notifTitle = "Có phản hồi mới";
                String notifContent = account.getFullName() + " đã trả lời bình luận của bạn.";
                String notifType = "COMMENT_REPLY";
                String refId = "COMMENT_" + parent.getId();
                notificationService.createNotification(parent.getAccount(), notifTitle, notifContent, notifType, refId);
            }
        }

        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public Comment updateComment(Integer commentId, String content, String userEmail) {
        if (content == null || content.isBlank()) {
            throw new RuntimeException("Content is required");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAccount().getEmail().equals(userEmail)) {
            throw new ForbiddenException("Bạn không có quyền sửa bình luận này.");
        }

        comment.setContent(content.trim());
        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public Comment updateCommentStatus(Integer commentId, Integer status, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isCommentAuthor = comment.getAccount().getEmail().equals(userEmail);
        boolean isThreadAuthor = false;
        boolean isLessonInstructor = false;
        
        if ("THREAD".equals(comment.getTargetType())) {
            isThreadAuthor = threadRepository.findById(Integer.parseInt(comment.getTargetId()))
                    .map(Thread::getAccount)
                    .map(account -> account.getEmail().equals(userEmail))
                    .orElse(false);
        } else if ("LESSON".equals(comment.getTargetType())) {
            isLessonInstructor = lessonRepository.findById(Integer.parseInt(comment.getTargetId()))
                    .map(this::resolveLessonCourse)
                    .map(Course::getAccount)
                    .map(account -> account.getEmail().equals(userEmail))
                    .orElse(false);
        }

        // Admin check
        boolean isAdmin = accountRepository.findByEmail(userEmail)
                .map(Account::getRole)
                .map(role -> role.getName() != null && role.getName().toUpperCase().contains("ADMIN"))
                .orElse(false);

        if (!isCommentAuthor && !isThreadAuthor && !isLessonInstructor && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền thay đổi trạng thái bình luận này.");
        }

        Integer oldStatus = comment.getStatus();
        comment.setStatus(status);
        Comment savedComment = commentRepository.save(comment);
        
        // Notification logic for hiding comment
        if (oldStatus != 0 && status == 0 && !isCommentAuthor && comment.getAccount() != null) {
            String notifTitle = "Bình luận bị ẩn";
            String notifContent = "Bình luận của bạn đã bị ẩn bởi giảng viên/quản trị do vi phạm nội quy hoặc không phù hợp.";
            String notifType = "COMMENT_HIDDEN";
            String refId = "COMMENT_" + comment.getId();
            notificationService.createNotification(comment.getAccount(), notifTitle, notifContent, notifType, refId);
        }
        
        return savedComment;
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isCommentAuthor = comment.getAccount().getEmail().equals(userEmail);
        boolean isThreadAuthor = false;
        boolean isLessonInstructor = false;
        if ("THREAD".equals(comment.getTargetType())) {
            isThreadAuthor = threadRepository.findById(Integer.parseInt(comment.getTargetId()))
                    .map(Thread::getAccount)
                    .map(account -> account.getEmail().equals(userEmail))
                    .orElse(false);
        } else if ("LESSON".equals(comment.getTargetType())) {
            isLessonInstructor = lessonRepository.findById(Integer.parseInt(comment.getTargetId()))
                    .map(this::resolveLessonCourse)
                    .map(Course::getAccount)
                    .map(account -> account.getEmail().equals(userEmail))
                    .orElse(false);
        }

        if (!isCommentAuthor && !isThreadAuthor && !isLessonInstructor) {
            throw new ForbiddenException("Bạn không có quyền xóa bình luận này.");
        }

        commentRepository.delete(comment);
    }

    private void ensureLessonCommentAccess(Account account, Lesson lesson) {
        Course course = resolveLessonCourse(lesson);
        boolean isInstructor = course.getAccount() != null && course.getAccount().getEmail().equals(account.getEmail());
        boolean isEnrolled = enrollmentRepository.existsByAccountAndCourseAndStatusIn(account, course, List.of(1, 2));
        boolean isAdmin = account.getRole() != null
                && account.getRole().getName() != null
                && account.getRole().getName().toUpperCase().contains("ADMIN");

        if (!isInstructor && !isEnrolled && !isAdmin) {
            throw new ForbiddenException("Bạn không có quyền bình luận trong bài học này.");
        }
    }

    private Course resolveLessonCourse(Lesson lesson) {
        if (lesson.getModule() == null || lesson.getModule().getCourse() == null) {
            throw new RuntimeException("Lesson course not found");
        }
        return lesson.getModule().getCourse();
    }

    private String normalizeTargetType(String targetType) {
        if (targetType == null || targetType.isBlank()) {
            throw new RuntimeException("targetType is required");
        }
        return targetType.trim().toUpperCase();
    }

    private String normalizeTargetId(String targetId) {
        if (targetId == null || targetId.isBlank()) {
            throw new RuntimeException("targetId is required");
        }
        return targetId.trim();
    }
}
