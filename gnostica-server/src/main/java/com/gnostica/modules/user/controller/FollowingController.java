package com.gnostica.modules.user.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.user.service.FollowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/follow")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FollowingController {

    private final FollowingService followingService;

    @GetMapping("/instructors")
    public ResponseEntity<?> getMyFollowedInstructors(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        return ResponseEntity.ok(ApiResponse.success(followingService.getFollowedInstructors(authentication.getName())));
    }

    @PostMapping("/toggle/{instructorId}")
    public ResponseEntity<?> toggleFollow(@PathVariable Integer instructorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập"));
        }
        boolean isFollowing = followingService.toggleFollow(authentication.getName(), instructorId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "isFollowing", isFollowing,
            "message", isFollowing ? "Đã theo dõi giảng viên" : "Đã bỏ theo dõi giảng viên"
        )));
    }

    @GetMapping("/check/{instructorId}")
    public ResponseEntity<?> checkFollowing(@PathVariable Integer instructorId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("isFollowing", false)));
        }
        boolean isFollowing = followingService.isFollowing(authentication.getName(), instructorId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFollowing", isFollowing)));
    }
}
