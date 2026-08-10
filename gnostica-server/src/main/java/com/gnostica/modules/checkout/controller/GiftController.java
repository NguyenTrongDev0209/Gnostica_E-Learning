package com.gnostica.modules.checkout.controller;

import com.gnostica.core.util.AuthUtil;
import com.gnostica.modules.checkout.dto.request.GiftCourseRequest;
import com.gnostica.modules.checkout.dto.response.GiftDetailResponse;
import com.gnostica.modules.checkout.dto.response.GiftSearchResponse;
import com.gnostica.modules.checkout.service.GiftService;
import com.gnostica.modules.checkout.dto.response.PaymentLinkResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.checkout.service.OrderService;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@RestController
@RequestMapping("/api/checkout/gifts")
@RequiredArgsConstructor
@Slf4j
public class GiftController {

    private final GiftService giftService;

    @GetMapping("/search-receiver")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GiftSearchResponse> searchReceiver(
            @RequestParam String email,
            @RequestParam UUID courseId) {
        String senderEmail = AuthUtil.getCurrentUserEmail();
        GiftSearchResponse response = giftService.searchReceiver(senderEmail, email, courseId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PaymentLinkResponse> createGift(@Valid @RequestBody GiftCourseRequest request) {
        try {
            String senderEmail = AuthUtil.getCurrentUserEmail();
            PaymentLinkResponse response = giftService.createGift(request, senderEmail);
            return ApiResponse.success(response);
        } catch (IllegalArgumentException e) {
            if (OrderService.ACCOUNT_NOT_ELIGIBLE.equals(e.getMessage())) {
                return ApiResponse.error(1001, OrderService.ACCOUNT_NOT_ELIGIBLE);
            }
            if (OrderService.COURSE_NOT_AVAILABLE.equals(e.getMessage())) {
                return ApiResponse.error(1002, OrderService.COURSE_NOT_AVAILABLE);
            }
            if (OrderService.OWN_COURSE_PURCHASE_NOT_ALLOWED.equals(e.getMessage())) {
                return ApiResponse.error(1003, OrderService.OWN_COURSE_PURCHASE_NOT_ALLOWED);
            }
            if (OrderService.ALREADY_ENROLLED.equals(e.getMessage())) {
                return ApiResponse.error(1004, OrderService.ALREADY_ENROLLED);
            }
            log.warn("Không thể tạo link tặng quà: {}", e.getMessage());
            return ApiResponse.error("Không thể tạo link thanh toán");
        } catch (Exception e) {
            log.error("Lỗi khi tạo link tặng quà", e);
            return ApiResponse.error("Lỗi khi tạo link thanh toán: " + e.getMessage());
        }
    }

    @GetMapping("/{token}")
    public ResponseEntity<GiftDetailResponse> getGiftByToken(@PathVariable String token) {
        GiftDetailResponse response = giftService.getGiftByToken(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.gnostica.modules.checkout.dto.response.GiftActionResponse> acceptGift(@PathVariable String token) {
        String receiverEmail = AuthUtil.getCurrentUserEmail();
        com.gnostica.modules.checkout.dto.response.GiftActionResponse response = giftService.acceptGift(token, receiverEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> rejectGift(@PathVariable String token) {
        String receiverEmail = AuthUtil.getCurrentUserEmail();
        giftService.rejectGift(token, receiverEmail);
        return ResponseEntity.ok().build();
    }
}


