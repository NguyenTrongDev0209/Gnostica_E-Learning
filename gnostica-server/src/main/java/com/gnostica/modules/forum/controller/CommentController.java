package com.gnostica.modules.forum.controller;

import com.gnostica.core.model.Comment;
import com.gnostica.modules.forum.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/thread/{threadId}")
    public ResponseEntity<?> getComments(@PathVariable Integer threadId) {
        return ResponseEntity.ok(commentService.getCommentsByThreadId(threadId));
    }

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Map<String, Object> payload) {
        
        String content = (String) payload.get("content");
        Integer threadId = payload.get("threadId") != null ? 
            (payload.get("threadId") instanceof String ? Integer.parseInt((String) payload.get("threadId")) : (Integer) payload.get("threadId")) 
            : null;
        String userEmail = (String) payload.get("userEmail"); // Lấy trực tiếp từ body
        Integer parentId = payload.get("parentId") != null ? 
            (payload.get("parentId") instanceof String ? Integer.parseInt((String) payload.get("parentId")) : (Integer) payload.get("parentId"))
            : null;

        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(401).body("Lỗi: Không tìm thấy Email người dùng!");
        }
        
        if (threadId == null) {
            return ResponseEntity.badRequest().body("Lỗi: threadId là bắt buộc!");
        }

        try {
            Comment comment = commentService.addComment(content, threadId, userEmail, parentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer id, @RequestParam String userEmail) {
        try {
            commentService.deleteComment(id, userEmail);
            return ResponseEntity.ok("Comment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
