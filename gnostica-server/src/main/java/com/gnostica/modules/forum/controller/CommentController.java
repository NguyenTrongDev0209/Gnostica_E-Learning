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

    @GetMapping("/target/{targetType}/{targetId}")
    public ResponseEntity<?> getCommentsByTarget(@PathVariable String targetType, @PathVariable String targetId) {
        return ResponseEntity.ok(commentService.getCommentsByTarget(targetType, targetId));
    }

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Map<String, Object> payload) {
        String content = (String) payload.get("content");
        String userEmail = (String) payload.get("userEmail");
        Integer parentId = parseInteger(payload.get("parentId"));

        String targetType = payload.get("targetType") != null ? payload.get("targetType").toString() : null;
        String targetId = payload.get("targetId") != null ? payload.get("targetId").toString() : null;

        Integer legacyThreadId = parseInteger(payload.get("threadId"));
        if ((targetType == null || targetType.isBlank() || targetId == null || targetId.isBlank()) && legacyThreadId != null) {
            targetType = "THREAD";
            targetId = legacyThreadId.toString();
        }

        if (userEmail == null || userEmail.isBlank()) {
            return ResponseEntity.status(401).body("Loi: Khong tim thay email nguoi dung!");
        }

        if (targetType == null || targetType.isBlank() || targetId == null || targetId.isBlank()) {
            return ResponseEntity.badRequest().body("Loi: targetType va targetId la bat buoc!");
        }

        try {
            Comment comment = commentService.addComment(content, targetType, targetId, userEmail, parentId);
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

    private Integer parseInteger(Object rawValue) {
        if (rawValue == null) return null;
        if (rawValue instanceof Integer value) return value;
        if (rawValue instanceof Number value) return value.intValue();
        return Integer.parseInt(rawValue.toString());
    }
}
