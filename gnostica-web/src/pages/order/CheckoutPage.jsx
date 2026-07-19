import React, { useState } from "react";
import couponService from "@/services/order/couponService";
import { Home, Star, CheckCircle2, ShieldCheck, Lock, QrCode, CreditCard } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { checkoutOrderItemsMock } from "@/mocks/cart";
import orderService from "@/services/order/orderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/micro/AppCard";
import Separator from "@/components/common/micro/AppSeparator";
import Badge from "@/components/common/micro/AppBadge";
import { Button } from "@/components/common/micro/AppButton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AppButton } from "@/components/common/micro/AppButton";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppInput from "@/components/common/micro/AppInput";

const PAYMENT_METHODS = [
  {
    id: "PAYOS",
    label: "PayOS",
    description: "Thanh toán bằng mã QR hoặc chuyển khoản ngân hàng",
    icon: QrCode,
    color: "text-success bg-green-50"
  },
  {
    id: "VNPAY",
    label: "VNPay",
    description: "Thanh toán bằng QR, thẻ ATM hoặc tài khoản ngân hàng",
    icon: CreditCard,
    color: "text-info bg-blue-50"
  }
];

// ── CheckoutOrderHeader ──
function CheckoutOrderHeader({ breadcrumbItems }) {
  return (
    <PageContainer.Header
      title="Thanh toán"
      description="Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng"
    >
      <AppBreadcrumb paths={breadcrumbItems} />
    </PageContainer.Header>
  );
}

// ── CheckoutOrderItemList ──
function CheckoutOrderItemList({ orderItems }) {
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
}

// ── CheckoutPaymentMethod ──
function CheckoutPaymentMethod({ paymentMethods, paymentMethod, setPaymentMethod }) {
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
}

// ── CheckoutTrustBadges ──
function CheckoutTrustBadges() {
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
}

// ── CheckoutOrderSummary ──
function CheckoutOrderSummary({
  orderItems, loading, subtotal, totalOriginal, discount,
  couponCode, setCouponCode, applyCoupon, removeCoupon, appliedCoupon, couponMessage, isCouponLoading
}) {
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
              <AppInput
                type="text"
                placeholder="Nhập mã giảm giá..."
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isCouponLoading || appliedCoupon != null}
                className={`w-full ${appliedCoupon ? 'pl-9 bg-success-soft border-success/20 text-success font-bold' : 'border-border'}`}
              />
            </div>
            <Button
              type="button"
              variant={appliedCoupon ? "outline" : "default"}
              className={appliedCoupon
                ? "text-error hover:text-error hover:bg-red-50 border-error/20"
                : "bg-accent text-accent-foreground hover:bg-accent/90 border-none disabled:bg-muted disabled:text-muted-foreground"}
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
          <AppButton appVariant="gradient"
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
          </AppButton>
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
}

// ── Page ──
export default function CheckoutPage() {
  const { state } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // Dùng dữ liệu từ CourseDetail nếu có, fallback về mock
  const orderItems = state?.orderItems ?? checkoutOrderItemsMock;

  // Calculators
  let currentSubtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  let extraDiscount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      extraDiscount = currentSubtotal * (appliedCoupon.discountPercent / 100);
    }
    if (appliedCoupon.maxDiscount && extraDiscount > appliedCoupon.maxDiscount) {
      extraDiscount = appliedCoupon.maxDiscount;
    }
    // Capped by max subtotal
    if (extraDiscount > currentSubtotal) {
      extraDiscount = currentSubtotal;
    }
  }

  const subtotal = currentSubtotal - extraDiscount;
  const totalOriginal = orderItems.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const discount = totalOriginal - subtotal;

  const applyCoupon = async () => {
    if (!couponCode) return;
    setIsCouponLoading(true);
    setCouponMessage("");
    try {
      const response = await couponService.validateCoupon(couponCode);
      if (response && response.data) {
        setAppliedCoupon(response.data);
        setCouponMessage(`Áp dụng thành công mã giảm giá!`);
      } else {
        setAppliedCoupon(null);
        setCouponMessage("Mã giảm giá không hợp lệ");
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponMessage(err.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Thanh toán", isLast: true },
  ];

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === "VNPAY" && subtotal < 10_000) {
      toast.error("VNPay yêu cầu đơn thanh toán tối thiểu 10.000đ. Vui lòng chọn PayOS cho đơn hàng này.");
      return;
    }

    if (paymentMethod === "PAYOS" || paymentMethod === "VNPAY") {
      setLoading(true);
      try {
        // Kiểm tra đăng nhập
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          toast.error("Vui lòng đăng nhập để thực hiện thanh toán!");
          setLoading(false);
          return;
        }

        // Chuẩn bị dữ liệu tạo đơn hàng theo CreatePaymentLinkRequestBody
        const requestBody = {
          courseId: orderItems[0]?.id,
          productName: orderItems.length === 1 ? orderItems[0].title : `Đơn hàng ${orderItems.length} khóa học`,
          description: `Thanh toan khoa hoc`,
          price: subtotal,
          paymentMethod,
          couponCode: appliedCoupon ? couponCode : null,
          returnUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`
        };

        const response = await orderService.createOrder(requestBody);

        if (response.status === "success" || response.code === "success" || response.data) {
          const paymentData = response.data;
          toast.success("Tạo đơn hàng thành công!");
          if (paymentData.status === "PAID") {
            window.location.assign(paymentData.checkoutUrl);
          } else if (paymentMethod === "VNPAY") {
            if (!paymentData.checkoutUrl) {
              throw new Error("VNPay không trả về đường dẫn thanh toán");
            }
            window.location.assign(paymentData.checkoutUrl);
          } else {
            navigate("/checkout/payos", {
              state: {
                paymentData,
                orderItems
              }
            });
          }
        } else {
          toast.error(response.message || "Không thể tạo đơn hàng. Vui lòng thử lại!");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error(typeof error === 'string' ? error : "Có lỗi xảy ra khi xử lý đơn hàng!");
      } finally {
        setLoading(false);
      }
    } else {
      toast.info("Phương thức thanh toán này hiện đang được bảo trì. Vui lòng chọn phương thức thanh toán khác.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <main className="app-container">
        <CheckoutOrderHeader breadcrumbItems={breadcrumbItems} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="lg:col-span-8 space-y-6">
              <CheckoutOrderItemList orderItems={orderItems} />
              <CheckoutPaymentMethod
                paymentMethods={PAYMENT_METHODS}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
              <CheckoutTrustBadges />
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-10 space-y-6">
                <CheckoutOrderSummary
                  orderItems={orderItems}
                  loading={loading}
                  subtotal={subtotal}
                  totalOriginal={totalOriginal}
                  discount={discount}
                  couponCode={couponCode}
                  setCouponCode={setCouponCode}
                  applyCoupon={applyCoupon}
                  removeCoupon={removeCoupon}
                  appliedCoupon={appliedCoupon}
                  couponMessage={couponMessage}
                  isCouponLoading={isCouponLoading}
                />
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-[11px] text-center font-bold text-primary italic">
                    * Khóa học sẽ được kích hoạt ngay sau khi thanh toán thành công
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
