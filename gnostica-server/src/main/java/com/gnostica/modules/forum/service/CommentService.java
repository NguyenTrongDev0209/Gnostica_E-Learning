package com.gnostica.modules.forum.service;

import com.gnostica.core.model.Comment;
import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByThreadId(Integer threadId);
    List<Comment> getCommentsByTarget(String targetType, String targetId);
    List<Comment> getCommentsByTarget(String targetType, String targetId, String userEmail);
    Comment addComment(String content, Integer threadId, String userEmail, Integer parentId);
    Comment addComment(String content, String targetType, String targetId, String userEmail, Integer parentId);
    Comment updateComment(Integer commentId, String content, String userEmail);
    Comment updateCommentStatus(Integer commentId, Integer status, String userEmail);
    void deleteComment(Integer commentId, String userEmail);
}
	
