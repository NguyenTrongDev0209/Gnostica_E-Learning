package com.gnostica.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.dto.request.CouponRequest;
import com.gnostica.dto.response.CouponResponse;
import com.gnostica.dto.response.ResponseDTO;
import com.gnostica.service.CouponService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<ResponseDTO<CouponResponse>> createCoupon(@Valid @RequestBody CouponRequest request) {
        try {
            CouponResponse response = couponService.createCoupon(request);
            return ResponseEntity.status(201).body(new ResponseDTO<>(201, "Coupon created successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(400, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ResponseDTO<java.util.List<CouponResponse>>> getAllCoupons() {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getAllCoupons()));
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseDTO<java.util.List<CouponResponse>>> getMyCoupons() {
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", couponService.getMyCoupons()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseDTO<CouponResponse>> updateCouponStatus(@PathVariable Integer id,
            @RequestParam Integer status) {
        try {
            CouponResponse response = couponService.updateCouponStatus(id, status);
            return ResponseEntity.ok(new ResponseDTO<>(200, "Cập nhật trạng thái thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(400, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO<Void>> deleteCoupon(@PathVariable Integer id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(new ResponseDTO<>(200, "Coupon deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(400, e.getMessage(), null));
        }
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<ResponseDTO<CouponResponse>> validateCoupon(@PathVariable String code) {
        try {
            CouponResponse response = couponService.validateCoupon(code);
            return ResponseEntity.ok(new ResponseDTO<>(200, "Mã giảm giá hợp lệ", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(400, e.getMessage(), null));
        }
    }
}
