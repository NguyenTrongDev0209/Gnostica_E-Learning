package com.gnostica.service.impl;

import com.gnostica.model.Account;
import com.gnostica.model.Comment;
import com.gnostica.model.Thread;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CommentRepository;
import com.gnostica.repository.ThreadRepository;
import com.gnostica.service.CommentService;
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

    @Override
    public List<Comment> getCommentsByObjectId(String objectId) {
        return commentRepository.findByObjectIdAndParentIsNullOrderByCreatedAtDesc(objectId);
    }

    @Override
    @Transactional
    public Comment addComment(String content, String objectId, String userEmail, Integer parentId) {
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found"));

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
