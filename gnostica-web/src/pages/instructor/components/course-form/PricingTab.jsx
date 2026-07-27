import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/common/micro/AppLabel";
import AppInput from "@/components/common/micro/AppInput";

export function PricingTab() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const price = watch("price") || 0;
  const discount = watch("discount") || 0;
  const finalPrice = price - (price * discount) / 100;

  return (
    <div className="space-y-8 py-4 w-full">
      <div>
        <h3 className="text-lg font-bold text-foreground border-b border-border pb-2 mb-4">
          Định giá & Cài đặt
        </h3>
        <p className="text-xs text-muted-foreground">
          Thiết lập giá bán và các chương trình ưu đãi cho học viên.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Ô nhập giá gốc - Format TRỰC TIẾP */}
          <div className="space-y-2">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Giá bán thực tế (VNĐ) <span className="text-error">*</span>
            </Label>
            <div className="relative">
              <Controller
                name="price"
                control={useFormContext().control}
                render={({ field }) => (
                  <AppInput
                    className="h-12 border-border hover:border-success/50 focus-visible:border-success focus-visible:ring-success/30 bg-white font-medium focus: pl-10"
                    placeholder="Ví dụ: 500.000"
                    value={field.value ? new Intl.NumberFormat("vi-VN").format(field.value) : ""}
                    onChange={(e) => {
                      // Chỉ lấy số từ chuỗi nhập vào
                      const rawValue = e.target.value.replace(/\D/g, "");
                      field.onChange(rawValue ? Number(rawValue) : "");
                    }}
                  />
                )}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₫</span>
            </div>
            {errors.price && (
              <p className="text-xs font-bold text-error mt-1.5 pl-1">{errors.price.message}</p>
            )}
          </div>

          {/* Ô hiển thị tổng tiền sau khi giảm */}
          <div className="space-y-2">
            <Label className="block text-xs font-bold text-success uppercase tracking-widest pl-1">
              Tổng tiền sau giảm (Hiển thị cho học viên)
            </Label>
            <div className="relative">
              <AppInput
                className="h-12 border-border hover:border-success/50 focus-visible:border-success focus-visible:ring-success/30 focus-visible:bg-white bg-muted font-medium pl-10 cursor-not-allowed"
                value={new Intl.NumberFormat("vi-VN").format(finalPrice)}
                readOnly
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-success font-bold text-sm">₫</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ô nhập % giảm giá */}
          <div className="space-y-2">
            <Label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Phần trăm giảm giá (%)
            </Label>
            <div className="relative">
              <AppInput
                type="number"
                className="h-12 border-border hover:border-success/50 focus-visible:border-success focus-visible:ring-success/30 bg-white font-medium focus: pl-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0 - 100"
                {...register("discount")}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">%</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium pl-1 italic">
              Giảm {discount}% tương đương giảm {new Intl.NumberFormat("vi-VN").format(price * discount / 100)}₫
            </p>
            {errors.discount && (
              <p className="text-xs font-bold text-error mt-1.5 pl-1">{errors.discount.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
