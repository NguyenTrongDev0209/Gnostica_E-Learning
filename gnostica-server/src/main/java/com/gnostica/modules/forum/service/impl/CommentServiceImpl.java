package com.gnostica.modules.forum.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Comment;
import com.gnostica.core.model.Thread;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.ThreadRepository;
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

    @Override
    public List<Comment> getCommentsByThreadId(Integer threadId) {
        return commentRepository.findByThreadIdAndParentIsNullOrderByCreatedAtDesc(threadId);
    }

    @Override
    @Transactional
    public Comment addComment(String content, Integer threadId, String userEmail, Integer parentId) {
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setThread(thread);
        comment.setAccount(account);
        comment.setStatus(1); // Mặc định Published

        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        return commentRepository.save(comment);
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

        commentRepository.delete(comment); // CascadeType.ALL will handle child replies
    }
}
