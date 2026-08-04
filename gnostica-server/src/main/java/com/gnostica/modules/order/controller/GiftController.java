package com.gnostica.modules.order.controller;

import com.gnostica.core.util.AuthUtil;
import com.gnostica.modules.order.dto.request.GiftCourseRequest;
import com.gnostica.modules.order.dto.response.GiftDetailResponse;
import com.gnostica.modules.order.dto.response.GiftSearchResponse;
import com.gnostica.modules.order.service.CourseGiftService;
import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders/gifts")
@RequiredArgsConstructor
public class GiftController {

    private final CourseGiftService courseGiftService;

    @GetMapping("/search-receiver")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GiftSearchResponse> searchReceiver(
            @RequestParam String email,
            @RequestParam UUID courseId) {
        String senderEmail = AuthUtil.getCurrentUserEmail();
        GiftSearchResponse response = courseGiftService.searchReceiver(senderEmail, email, courseId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentLinkResponse> createGift(@Valid @RequestBody GiftCourseRequest request) throws Exception {
        String senderEmail = AuthUtil.getCurrentUserEmail();
        PaymentLinkResponse response = courseGiftService.createGift(request, senderEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}")
    public ResponseEntity<GiftDetailResponse> getGiftByToken(@PathVariable String token) {
        GiftDetailResponse response = courseGiftService.getGiftByToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> acceptGift(@PathVariable String token) {
        String receiverEmail = AuthUtil.getCurrentUserEmail();
        courseGiftService.acceptGift(token, receiverEmail);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{token}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> rejectGift(@PathVariable String token) {
        String receiverEmail = AuthUtil.getCurrentUserEmail();
        courseGiftService.rejectGift(token, receiverEmail);
        return ResponseEntity.ok().build();
    }
}

