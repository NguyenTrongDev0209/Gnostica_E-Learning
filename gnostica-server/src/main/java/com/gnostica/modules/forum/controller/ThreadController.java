package com.gnostica.modules.forum.controller;

import com.gnostica.core.model.Thread;
import com.gnostica.modules.forum.service.ThreadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/threads")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ThreadController {

    @Autowired
    private ThreadService threadService;

    @GetMapping
    public ResponseEntity<?> getAllThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "views") String sortBy) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
            return ResponseEntity.ok(threadService.getAllThreads(pageable));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching threads: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getThreadById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(threadService.getThreadById(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error fetching thread: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> incrementView(@PathVariable Integer id) {
        try {
            threadService.incrementView(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> createThread(
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "authorEmail", required = false) String authorEmail,
            @RequestParam(value = "categoryId", required = false) Integer categoryId,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        try {
            System.out.println("--- Create Thread Debug ---");
            System.out.println("Content: " + content);
            System.out.println("AuthorEmail: " + authorEmail);
            System.out.println("CategoryId: " + categoryId);
            System.out.println("Images received: " + (images != null ? images.size() : 0));

            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Missing required field: content");
            }
            if (authorEmail == null || authorEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Missing required field: authorEmail. Please make sure you are logged in.");
            }

            Thread newThread = threadService.createThread(content, categoryId, authorEmail, images);
            return ResponseEntity.ok(newThread);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating thread: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeThread(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        try {
            String userEmail = payload.get("userEmail");
            if (userEmail == null || userEmail.isEmpty()) {
                userEmail = payload.get("email");
            }
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.badRequest().body("Lỗi: Yêu cầu cung cấp Email người dùng!");
            }
            return ResponseEntity.ok(threadService.likeThread(id, userEmail));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error liking thread: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/like-status")
    public ResponseEntity<?> getLikeStatus(@PathVariable Integer id, @RequestParam String email) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("isLiked", threadService.hasLiked(id, email));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/top-contributors")
    public ResponseEntity<?> getTopContributors() {
        try {
            return ResponseEntity.ok(threadService.getTopContributors());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching top contributors: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<?> getRelatedThreads(@PathVariable Integer id) {
        try {
            Thread currentThread = (Thread) threadService.getThreadById(id);
            if (currentThread.getCategory() == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            return ResponseEntity.ok(threadService.getRelatedThreads(
                    currentThread.getCategory().getId(), id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching related threads: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyThreads(
            @RequestParam String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            return ResponseEntity.ok(threadService.getThreadsByEmail(email, pageable));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching your threads: " + e.getMessage());
        }
    }

    @GetMapping("/me/stats")
    public ResponseEntity<?> getMyStats(@RequestParam String email) {
        try {
            return ResponseEntity.ok(threadService.getUserStats(email));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching your statistics: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteThread(@PathVariable Integer id) {
        try {
            threadService.deleteThread(id);
            return ResponseEntity.ok(Map.of("message", "Thread deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting thread: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingThreads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            return ResponseEntity.ok(threadService.getPendingThreads(pageable));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching pending threads: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveThread(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(threadService.approveThread(id));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error approving thread: " + e.getMessage());
        }
    }
}
