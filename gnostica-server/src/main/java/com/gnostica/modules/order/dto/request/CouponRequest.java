package com.gnostica.modules.order.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.gnostica.core.constant.CouponDiscountType;
import com.gnostica.core.constant.CouponStatus;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponRequest {

    @NotBlank(message = "Ten phieu giam gia khong duoc de trong")
    @Size(max = 255, message = "Ten phieu giam gia khong duoc vuot qua 255 ky tu")
    private String name;

    @NotBlank(message = "Ma giam gia khong duoc de trong")
    @Pattern(regexp = "^GNS-[A-Z0-9]{6}$", message = "Ma giam gia phai theo dang GNS-XXXXXX")
    private String code;

    @NotNull(message = "Loai giam gia khong duoc de trong")
    private Integer discountType;

    @NotNull(message = "Gia tri giam khong duoc de trong")
    @DecimalMin(value = "0.000001", message = "Gia tri giam phai lon hon 0")
    @Digits(integer = 12, fraction = 6, message = "Gia tri giam khong hop le")
    private BigDecimal discountValue;

    @DecimalMin(value = "0", message = "Muc giam toi da khong duoc am")
    @Digits(integer = 12, fraction = 6, message = "Muc giam toi da khong hop le")
    private BigDecimal maxDiscount;

    @DecimalMin(value = "0", message = "Gia tri don hang toi thieu khong duoc am")
    @Digits(integer = 12, fraction = 6, message = "Gia tri don hang toi thieu khong hop le")
    private BigDecimal minDiscount;

    @NotNull(message = "Thoi diem bat dau khong duoc de trong")
    private LocalDateTime validFrom;

    @NotNull(message = "Thoi diem ket thuc khong duoc de trong")
    private LocalDateTime validUntil;

    @NotNull(message = "So luong phat hanh khong duoc de trong")
    @Min(value = 0, message = "So luong phat hanh khong duoc am")
    private Integer quantity;

    private Integer status;

    private String metadata;

    @AssertTrue(message = "Loai giam gia khong hop le")
    public boolean isDiscountTypeValid() {
        return CouponDiscountType.isSupported(discountType);
    }

    @AssertTrue(message = "Trang thai coupon khong hop le")
    public boolean isStatusValid() {
        return status == null || CouponStatus.isSupported(status);
    }

    @AssertTrue(message = "Giam theo phan tram phai nam trong khoang tu 0 den 100")
    public boolean isPercentageValueValid() {
        return discountType != CouponDiscountType.PERCENTAGE || discountValue == null
                || discountValue.compareTo(BigDecimal.valueOf(100)) <= 0;
    }

    @AssertTrue(message = "Muc giam toi da chi ap dung cho giam theo phan tram")
    public boolean isMaxDiscountValid() {
        return discountType != CouponDiscountType.FIXED_AMOUNT || maxDiscount == null;
    }

    @AssertTrue(message = "Thoi diem ket thuc phai sau thoi diem bat dau")
    public boolean isValidityPeriodValid() {
        return validFrom == null || validUntil == null || validUntil.isAfter(validFrom);
    }
}
