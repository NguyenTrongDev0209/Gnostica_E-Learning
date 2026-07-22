package com.gnostica.modules.forum.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Comment;
import com.gnostica.core.model.Thread;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.LessonRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.modules.forum.service.CommentService;
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
            lessonRepository.findById(Integer.parseInt(normalizedTargetId))
                    .orElseThrow(() -> new RuntimeException("Lesson not found"));
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
        }

        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Integer commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isCommentAuthor = comment.getAccount().getEmail().equals(userEmail);
        boolean isThreadAuthor = false;
        if ("THREAD".equals(comment.getTargetType())) {
            isThreadAuthor = threadRepository.findById(Integer.parseInt(comment.getTargetId()))
                    .map(Thread::getAccount)
                    .map(account -> account.getEmail().equals(userEmail))
                    .orElse(false);
        }

        if (!isCommentAuthor && !isThreadAuthor) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
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
