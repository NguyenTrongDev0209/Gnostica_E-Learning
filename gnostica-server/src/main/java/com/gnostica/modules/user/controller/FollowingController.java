package com.gnostica.modules.user.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.user.service.FollowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
public class FollowingController {

    private final FollowingService followingService;

    @GetMapping("/instructors")
    public ResponseEntity<?> getMyFollowedInstructors(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p"));
        }
        return ResponseEntity.ok(ApiResponse.success(followingService.getFollowedInstructors(authentication.getName())));
    }

    @PostMapping("/toggle/{instructorId}")
    public ResponseEntity<?> toggleFollow(@PathVariable UUID instructorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p"));
        }
        boolean isFollowing = followingService.toggleFollow(authentication.getName(), instructorId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "isFollowing", isFollowing,
            "message", isFollowing ? "ÄÃ£ theo dÃµi giáº£ng viÃªn" : "ÄÃ£ bá» theo dÃµi giáº£ng viÃªn"
        )));
    }

    @GetMapping("/check/{instructorId}")
    public ResponseEntity<?> checkFollowing(@PathVariable UUID instructorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("isFollowing", false)));
        }
        boolean isFollowing = followingService.isFollowing(authentication.getName(), instructorId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFollowing", isFollowing)));
    }
}
