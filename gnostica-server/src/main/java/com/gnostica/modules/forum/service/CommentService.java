package com.gnostica.modules.forum.service;

import com.gnostica.core.model.Comment;
import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByThreadId(Integer threadId);
    List<Comment> getCommentsByTarget(String targetType, String targetId);
    Comment addComment(String content, Integer threadId, String userEmail, Integer parentId);
    Comment addComment(String content, String targetType, String targetId, String userEmail, Integer parentId);
    void deleteComment(Integer commentId, String userEmail);
}
	
