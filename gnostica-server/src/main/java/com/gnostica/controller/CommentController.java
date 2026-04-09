package com.gnostica.controller;

import com.gnostica.model.Comment;
import com.gnostica.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/thread/{threadId}")
    public ResponseEntity<?> getComments(@PathVariable String threadId) {
        return ResponseEntity.ok(commentService.getCommentsByObjectId(threadId));
    }

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Map<String, Object> payload) {
        
        String content = (String) payload.get("content");
        String objectId = (String) payload.get("objectId");
        String userEmail = (String) payload.get("userEmail"); // Lấy trực tiếp từ body
        Integer parentId = (Integer) payload.get("parentId");

        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body("Lỗi: Không tìm thấy Email người dùng!");
        }

        try {
            Comment comment = commentService.addComment(content, objectId, userEmail, parentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
