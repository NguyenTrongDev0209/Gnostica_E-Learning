package com.gnostica.modules.course.controller;

import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.course.dto.request.ReviewReplyRequest;
import com.gnostica.modules.course.dto.request.ReviewRequest;
import com.gnostica.modules.course.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseDTO<String>> submitReview(@RequestBody @Valid ReviewRequest request, Principal principal) {
        reviewService.submitReview(request, principal.getName());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Review submitted successfully", null));
    }

    @PostMapping("/reply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResponseDTO<String>> replyToReview(@RequestBody @Valid ReviewReplyRequest request, Principal principal) {
        reviewService.replyToReview(request, principal.getName());
        return ResponseEntity.ok(new ResponseDTO<>(200, "Reply submitted successfully", null));
    }

    @GetMapping("/course/{slug}")
    public ResponseEntity<ResponseDTO<Map<String, Object>>> getCourseReviews(@PathVariable String slug) {
        Map<String, Object> response = reviewService.getCourseReviews(slug);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", response));
    }
}
