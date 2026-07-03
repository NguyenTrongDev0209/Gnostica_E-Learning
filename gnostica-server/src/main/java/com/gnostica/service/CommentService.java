package com.gnostica.service;

import com.gnostica.core.model.Comment;
import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByObjectId(String objectId);
    Comment addComment(String content, String objectId, String userEmail, Integer parentId);
    void deleteComment(Integer commentId, String userEmail);
}
	