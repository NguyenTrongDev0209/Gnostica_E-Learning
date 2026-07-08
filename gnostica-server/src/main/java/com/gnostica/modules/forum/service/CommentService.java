package com.gnostica.modules.forum.service;

import com.gnostica.core.model.Comment;
import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByThreadId(Integer threadId);
    Comment addComment(String content, Integer threadId, String userEmail, Integer parentId);
    void deleteComment(Integer commentId, String userEmail);
}
	