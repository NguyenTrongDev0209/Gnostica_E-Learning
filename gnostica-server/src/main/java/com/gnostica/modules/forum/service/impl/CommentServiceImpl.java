package com.gnostica.modules.forum.service.impl;
import com.gnostica.service.*;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Comment;
import com.gnostica.core.model.Thread;
import com.gnostica.core.model.Lesson;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.core.repository.LessonRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.modules.forum.service.CommentService;
import java.util.Optional;
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

    @Override
    public List<Comment> getCommentsByObjectId(String objectId) {
        return commentRepository.findByObjectIdAndParentIsNullOrderByCreatedAtDesc(objectId);
    }

    @Override
    @Transactional
    public Comment addComment(String content, String objectId, String userEmail, Integer parentId) {
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // Backend Security: Bắt buộc học viên đã mua khóa học mới được comment vào "lesson_xxx"
        if (objectId != null && objectId.startsWith("lesson_")) {
            try {
                Integer lessonId = Integer.parseInt(objectId.replace("lesson_", ""));
                Lesson lesson = lessonRepository.findById(lessonId)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy bài học"));
                
                Course course = lesson.getModule().getCourse();
                
                boolean isInstructor = course.getAccount().getId().equals(account.getId());
                boolean isAdmin = "ADMIN".equals(account.getRole().getName());
                
                if (!isInstructor && !isAdmin) {
                    Optional<Enrollment> enrollment = enrollmentRepository.findByAccountAndCourse(account, course);
                    if (enrollment.isEmpty()) {
                        throw new RuntimeException("Bạn phải mua khóa học để được bình luận trong bài học này.");
                    }
                }
            } catch (NumberFormatException e) {
                // Invalid lesson ID format
                throw new RuntimeException("ID bài học không hợp lệ.");
            }
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setObjectId(objectId);
        comment.setAccount(account);

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        Comment savedComment = commentRepository.save(comment);

        // Cập nhật số lượng bình luận cho Thread nếu objectId là numeric ID của Thread
        try {
            Integer threadId = Integer.parseInt(objectId);
            Optional<Thread> threadOpt = threadRepository.findById(threadId);
            if (threadOpt.isPresent()) {
                Thread thread = threadOpt.get();
                Integer currentCount = thread.getCommentCount();
                thread.setCommentCount((currentCount == null ? 0 : currentCount) + 1);
                threadRepository.save(thread);
            }
        } catch (NumberFormatException e) {
            // Không phải ID của Thread (có thể là Lesson ID hoặc chuỗi khác), bỏ qua
        }

        return savedComment;
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Verify ownership
        if (!comment.getAccount().getEmail().equals(userEmail)) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }

        // Count how many comments are being deleted (parent + all replies recursively)
        int totalDeleted = countCommentsRecursively(comment);

        String objectId = comment.getObjectId();
        commentRepository.delete(comment); // CascadeType.ALL will handle child replies

        // Update Thread commentCount if applicable
        try {
            Integer threadId = Integer.parseInt(objectId);
            Optional<Thread> threadOpt = threadRepository.findById(threadId);
            if (threadOpt.isPresent()) {
                Thread thread = threadOpt.get();
                Integer currentCount = thread.getCommentCount();
                int newCount = Math.max(0, (currentCount == null ? 0 : currentCount) - totalDeleted);
                thread.setCommentCount(newCount);
                threadRepository.save(thread);
            }
        } catch (NumberFormatException e) {
            // Not a numeric thread ID
        }
    }

    private int countCommentsRecursively(Comment comment) {
        int count = 1; // The comment itself
        if (comment.getReplies() != null) {
            for (Comment reply : comment.getReplies()) {
                count += countCommentsRecursively(reply);
            }
        }
        return count;
    }
}
