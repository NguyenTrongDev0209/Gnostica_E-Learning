package com.gnostica.modules.checkout.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.core.dto.response.ResponseDTO;
import com.gnostica.modules.checkout.dto.request.CouponRequest;
import com.gnostica.modules.checkout.dto.response.CouponResponse;
import com.gnostica.modules.checkout.service.CouponService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/checkout/coupons")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<ResponseDTO<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.createCoupon(request);
        return ResponseEntity.status(201).body(new ResponseDTO<>(201, "Coupon created successfully", response));
    }

    /**
     * Returns only coupons owned by the authenticated account. This route is
     * retained so the current web client remains compatible during the UI phase.
     */
    @GetMapping
    public ResponseEntity<ResponseDTO<List<CouponResponse>>> getCoupons() {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getAllCoupons()));
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseDTO<List<CouponResponse>>> getMyCoupons() {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getMyCoupons()));
    }

    @GetMapping("/admin")
    public ResponseEntity<ResponseDTO<List<CouponResponse>>> getAdminCoupons(@RequestParam String ownerType) {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getAdminCoupons(ownerType)));
    }

    @GetMapping("/scope-options/courses")
    public ResponseEntity<ResponseDTO<List<com.gnostica.modules.checkout.dto.response.CouponScopeOptionResponse>>> getScopeCourseOptions() {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getScopeCourseOptions()));
    }

    @GetMapping("/scope-options/categories")
    public ResponseEntity<ResponseDTO<List<com.gnostica.modules.checkout.dto.response.CouponScopeOptionResponse>>> getScopeCategoryOptions() {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getScopeCategoryOptions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO<CouponResponse>> getCouponById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getCouponById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDTO<CouponResponse>> updateCoupon(
            @PathVariable UUID id,
            @Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.updateCoupon(id, request);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Coupon updated successfully", response));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseDTO<CouponResponse>> updateCouponStatus(
            @PathVariable UUID id,
            @RequestParam Integer status) {
        CouponResponse response = couponService.updateCouponStatus(id, status);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Coupon status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO<Void>> deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Coupon deleted successfully", null));
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<ResponseDTO<CouponResponse>> validateCoupon(
            @PathVariable String code,
            @RequestParam UUID courseId) {
        CouponResponse response = couponService.validateCoupon(code, courseId);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Coupon is valid", response));
    }
}

