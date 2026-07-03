package com.gnostica.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.service.FavouriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FavouriteController {

    private final FavouriteService favouriteService;

    @GetMapping
    public ResponseEntity<?> getMyFavourites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để xem danh sách yêu thích"));
        }
        return ResponseEntity.ok(ApiResponse.success(favouriteService.getFavouriteCourses(authentication.getName())));
    }

    @PostMapping("/toggle/{courseId}")
    public ResponseEntity<?> toggleFavourite(@PathVariable Integer courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lòng đăng nhập để thực hiện chức năng này"));
        }
        boolean isAdded = favouriteService.toggleFavourite(authentication.getName(), courseId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "isFavourite", isAdded,
            "message", isAdded ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích"
        )));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<?> checkFavourite(@PathVariable Integer courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("isFavourite", false)));
        }
        boolean isFavourite = favouriteService.isFavourite(authentication.getName(), courseId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavourite", isFavourite)));
    }
}
