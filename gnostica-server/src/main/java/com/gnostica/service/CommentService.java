package com.gnostica.service;

import com.gnostica.model.Comment;
import java.util.List;

public interface CommentService {
    List<Comment> getCommentsByObjectId(String objectId);
    Comment addComment(String content, String objectId, String userEmail, Integer parentId);
}
