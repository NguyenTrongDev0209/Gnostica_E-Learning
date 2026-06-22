import React from "react";
import { Link } from "react-router-dom";
import { Star, CheckCircle2, ShieldCheck, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SimpleButton } from "@/components/common/AppButton";
import { AppBreadcrumb, PageHeader } from "@/components/common/AppSection";

/**
 * Header for the Checkout page, including breadcrumbs and title.
 */
export const CheckoutOrderHeader = ({ breadcrumbItems }) => {
  return (
    <div className="mb-0">
      <AppBreadcrumb
        items={breadcrumbItems}
        linkClassName="text-muted-foreground hover:text-primary"
        activeClassName="font-semibold text-foreground"
        separatorClassName="text-slate-300"
      />
      <PageHeader
        title="Thanh toán"
        description="Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng"
        className="mt-4"
      />
    </div>
  );
};

/**
 * List of order items displayed during checkout.
 */
export const CheckoutOrderItemList = ({ orderItems }) => {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-muted border-b border-border">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
            1
          </span>
          Thông tin đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="p-6 flex items-center gap-4 hover:bg-muted transition-colors"
            >
              <div className="w-24 h-16 md:w-32 md:h-20 shrink-0 rounded-lg overflow-hidden border border-border shadow-sm">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-bold text-foreground line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium italic truncate">
                  Giảng viên: {item.instructor}
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(item.rating)
                          ? "text-warning fill-yellow-400"
                          : "text-slate-200 fill-slate-100"
                        }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-right flex-none w-24 md:w-32 border-l border-slate-50">
                <p className="font-black text-lg text-gradient-button font-extrabold">
                  {item.price.toLocaleString()}đ
                </p>
                {item.originalPrice && (
                  <p className="text-xs text-muted-foreground line-through font-medium">
                    {item.originalPrice.toLocaleString()}đ
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Payment method selection radio group.
 */
export const CheckoutPaymentMethod = ({ paymentMethods, paymentMethod, setPaymentMethod }) => {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-muted border-b border-border">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
            2
          </span>
          Phương thức thanh toán
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;
            return (
              <label
                key={method.id}
                htmlFor={method.id}
                className={`
                  relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-border hover:bg-muted"
                  }
                `}
              >
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${method.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
              </label>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

/**
 * Trust badges for the Checkout page.
 */
export const CheckoutTrustBadges = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-border">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-success">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-foreground">SSL bảo mật</p>
          <p className="text-muted-foreground">Mã hóa 256-bit</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-border">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-info">
          <Lock className="w-6 h-6" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-foreground">Bảo vệ dữ liệu</p>
          <p className="text-muted-foreground">Không lưu thông tin thẻ</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-border">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-warning">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-foreground">Hoàn tiền 30 ngày</p>
          <p className="text-muted-foreground">Đảm bảo chất lượng</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Summary of the order including subtotal, discount, and payment button.
 */
export const CheckoutOrderSummary = ({
  orderItems, loading, subtotal, totalOriginal, discount,
  couponCode, setCouponCode, applyCoupon, removeCoupon, appliedCoupon, couponMessage, isCouponLoading
}) => {
  return (
    <Card className="border-none shadow-2xl shadow-orange-500/10 overflow-hidden bg-white">
      <CardHeader className="bg-muted border-b border-border py-5">
        <CardTitle className="text-xl font-bold text-foreground text-center uppercase tracking-tight">
          Tổng kết đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 py-6 space-y-4">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Tạm tính ({orderItems.length} khóa học)</span>
            <span>{totalOriginal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="text-error">-{discount.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Phí xử lý</span>
            <Badge
              variant="outline"
              className="text-[10px] text-success border-success/20 bg-green-50 font-bold"
            >
              MIỄN PHÍ
            </Badge>
          </div>
        </div>

        <Separator className="bg-secondary" />

        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-foreground">Tổng thanh toán</span>
          <div className="text-right">
            <div className="text-3xl font-bold text-gradient-button font-extrabold leading-none">
              {subtotal.toLocaleString()}đ
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1.5 px-0.5">
              đã bao gồm thuế
            </p>
          </div>
        </div>

        <div className="pt-2 pb-4 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              {appliedCoupon && (
                <CheckCircle2 className="w-4 h-4 text-success absolute left-3 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isCouponLoading || appliedCoupon != null}
                className={`w-full border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary transition-all ${appliedCoupon ? 'pl-9 bg-green-50/50 border-success/20 text-success font-bold' : 'border-border'}`}
              />
            </div>
            <Button
              type="button"
              variant={appliedCoupon ? "outline" : "default"}
              className={appliedCoupon ? "text-error hover:text-error hover:bg-red-50 border-error/20" : "bg-muted border-none"}
              onClick={appliedCoupon ? removeCoupon : applyCoupon}
              disabled={isCouponLoading || (!couponCode && !appliedCoupon)}
            >
              {isCouponLoading ? "..." : appliedCoupon ? "Bỏ" : "Áp dụng"}
            </Button>
          </div>
          {couponMessage && (
            <p className={`text-xs ml-1 font-medium ${appliedCoupon ? 'text-success' : 'text-error'}`}>{couponMessage}</p>
          )}
        </div>

        <div className="pt-2">
          <SimpleButton
            type="submit"
            className="w-fit mx-auto py-7 px-16 text-lg font-bold tracking-wide gap-2 flex"
            size="lg"
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin w-5 h-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN THANH TOÁN"}
          </SimpleButton>
        </div>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed pt-2">
          Bằng việc nhấn "Xác nhận thanh toán", bạn đồng ý với{" "}
          <Link to="/terms" className="text-primary hover:underline font-medium">
            điều khoản dịch vụ
          </Link>{" "}
          của chúng tôi.
        </p>
      </CardContent>
    </Card>
  );
};
