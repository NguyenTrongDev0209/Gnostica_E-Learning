package com.gnostica.modules.user.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.user.service.FavouriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/favourites")
@RequiredArgsConstructor
public class FavouriteController {

    private final FavouriteService favouriteService;

    @GetMapping
    public ResponseEntity<?> getMyFavourites(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem danh sÃ¡ch yÃªu thÃ­ch"));
        }
        return ResponseEntity.ok(ApiResponse.success(favouriteService.getFavouriteCourses(authentication.getName())));
    }

    @PostMapping("/toggle/{courseId}")
    public ResponseEntity<?> toggleFavourite(@PathVariable UUID courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n chá»©c nÄƒng nÃ y"));
        }
        boolean isAdded = favouriteService.toggleFavourite(authentication.getName(), courseId);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "isFavourite", isAdded,
            "message", isAdded ? "ÄÃ£ thÃªm vÃ o danh sÃ¡ch yÃªu thÃ­ch" : "ÄÃ£ xÃ³a khá»i danh sÃ¡ch yÃªu thÃ­ch"
        )));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<?> checkFavourite(@PathVariable UUID courseId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("isFavourite", false)));
        }
        boolean isFavourite = favouriteService.isFavourite(authentication.getName(), courseId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isFavourite", isFavourite)));
    }
}
