import React, { useEffect, useState } from "react";
import couponService from "@/services/order/couponService";
import { Star, CheckCircle2, QrCode, CreditCard, Loader2 } from "lucide-react";
import { useLocation, Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import orderService from "@/services/order/orderService";
import giftService from "@/services/course/giftService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/micro/AppCard";
import Separator from "@/components/common/micro/AppSeparator";
import { AppButton } from "@/components/common/micro/AppButton";
import { RadioGroup } from "@/components/ui/radio-group";
import { AppRadioGroupItem } from "@/components/common/micro/AppRadioGroup";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppInput from "@/components/common/micro/AppInput";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import {
  AppDialogRoot,
  AppDialogContent,
  AppDialogHeader,
  AppDialogTitle,
  AppDialogDescription,
} from "@/components/common/micro/AppDialog";
import PayosQR from "@/pages/order/PayosQR";
import CheckoutResultDialog from "@/pages/order/CheckoutResultDialog";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";

const PAYMENT_METHODS = [
  {
    id: "PAYOS",
    label: "PayOS",
    description: "Thanh toán bằng mã QR hoặc chuyển khoản ngân hàng",
    icon: QrCode,
    color: "text-success bg-success-soft"
  },
  {
    id: "VNPAY",
    label: "VNPay",
    description: "Thanh toán bằng QR, thẻ ATM hoặc tài khoản ngân hàng",
    icon: CreditCard,
    color: "text-info bg-info-soft"
  }
];

// ── CheckoutOrderHeader ──
function CheckoutOrderHeader({ breadcrumbItems }) {
  return (
    <div>
      <AppBreadcrumb paths={breadcrumbItems} className="mb-8" />
      <AppPageHeader
        title="Thanh toán"
        description="Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng"
        titleClassName="text-3xl font-bold md:text-4xl"
      />
    </div>
  );
}

// ── CheckoutOrderItemList ──
function CheckoutOrderItemList({ orderItems }) {
  return (
    <Card appVariant="default" className="gap-0 overflow-hidden py-0 shadow-none">
      <CardHeader className="border-b border-border bg-muted py-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            1
          </span>
          Thông tin đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-6 transition-colors hover:bg-muted/60"
            >
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border md:h-20 md:w-32">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <h3 className="font-bold text-foreground line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="truncate text-xs font-normal text-muted-foreground">
                  Giảng viên: {item.instructor}
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(item.rating)
                          ? "fill-warning text-warning"
                          : "fill-transparent text-border"
                        }`}
                    />
                  ))}
                </div>
              </div>
              <div className="w-24 flex-none border-l border-border text-right md:w-32">
                <p className="text-gradient-button text-lg font-bold">
                  {item.price.toLocaleString()}đ
                </p>
                {item.originalPrice && (
                  <p className="text-xs font-normal text-muted-foreground line-through">
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
    <section>
      <div className="mb-6 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            2
          </span>
          <h2 className="text-lg font-bold text-foreground">Phương thức thanh toán</h2>
      </div>
      <div>
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
                  relative flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors
                  ${isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/60"
                  }
                `}
              >
                <AppRadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${method.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{method.label}</p>
                  <p className="min-h-8 text-xs leading-4 text-muted-foreground">{method.description}</p>
                </div>
                <CheckCircle2
                  aria-hidden="true"
                  className={`size-5 shrink-0 text-primary transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                />
              </label>
            );
          })}
        </RadioGroup>
      </div>
    </section>
  );
}

// ── CheckoutOrderSummary ──
function CheckoutOrderSummary({
  loading, subtotal, totalOriginal, discount,
  couponCode, setCouponCode, applyCoupon, removeCoupon, appliedCoupon, couponMessage, isCouponLoading
}) {
  return (
    <Card appVariant="default" className="gap-0 overflow-hidden py-0 shadow-none">
      <CardHeader className="border-b border-border bg-muted py-5">
        <CardTitle className="text-center text-xl font-bold text-foreground">
          Tổng kết đơn hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="px-8 py-6 space-y-4">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm font-normal text-muted-foreground">
            <span>Giá gốc</span>
            <span>{totalOriginal.toLocaleString()}đ</span>
          </div>
          <div className="flex justify-between text-sm font-normal">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="text-error">-{discount.toLocaleString()}đ</span>
          </div>
        </div>

        <Separator className="bg-secondary" />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-foreground">Tổng tiền:</span>
          <span className="text-gradient-button text-xl font-bold leading-none">
            {subtotal.toLocaleString()}đ
          </span>
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
            <AppButton
              type="button"
              appVariant={appliedCoupon ? "ghostMuted" : "accent"}
              className={appliedCoupon
                ? "border border-error/20 text-error hover:bg-error-soft hover:text-error"
                : "disabled:bg-muted disabled:text-muted-foreground"}
              onClick={appliedCoupon ? removeCoupon : applyCoupon}
              disabled={isCouponLoading || (!couponCode && !appliedCoupon)}
            >
              {isCouponLoading ? "..." : appliedCoupon ? "Bỏ" : "Áp dụng"}
            </AppButton>
          </div>
          {couponMessage && (
            <p className={`ml-1 text-sm font-normal ${appliedCoupon ? 'text-success' : 'text-error'}`}>{couponMessage}</p>
          )}
        </div>

        <div className="pt-2">
          <AppButton appVariant="gradient"
            type="submit"
            className="flex w-full gap-2 rounded-xl py-7 text-lg font-bold"
            size="lg"
            disabled={loading}
          >
            {loading && (
              <Loader2 className="size-5 animate-spin" />
            )}
            {loading ? "Đang xử lí" : "Xác nhận thanh toán"}
          </AppButton>
        </div>

        <p className="pt-2 text-center text-sm leading-relaxed text-muted-foreground">
          Bằng việc nhấn "Xác nhận thanh toán", bạn đồng ý với{" "}
          <Link to="/terms" className="font-bold text-primary hover:underline">
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
  const navigate = useNavigate();
  const { orderCode: routeOrderCode } = useParams();
  const [searchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("PAYOS");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [payosDialogData, setPayosDialogData] = useState(null);
  const [isPayosCancelConfirmOpen, setIsPayosCancelConfirmOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  // Dùng dữ liệu từ CourseDetail nếu có, fallback về mock
  const location = useLocation();
  const state = location.state || {};
  const { isGift, giftDetails } = state;
  const orderItems = state.orderItems || [];
  const hasCheckoutDraft = Array.isArray(orderItems) && orderItems.length > 0;
  const queryOrderCode = searchParams.get("orderCode");
  const callbackOrderCode = queryOrderCode || routeOrderCode;
  const hasCheckoutCallback =
    Boolean(callbackOrderCode) ||
    Boolean(searchParams.get("gateway")) ||
    Boolean(searchParams.get("paymentStatus")) ||
    Boolean(searchParams.get("verified")) ||
    searchParams.get("cancelled") === "true" ||
    location.pathname.includes("/checkout/success") ||
    location.pathname.includes("/checkout/cancel");

  useEffect(() => {
    const gateway = searchParams.get("gateway");
    const paymentStatus = searchParams.get("paymentStatus");
    const verified = searchParams.get("verified");
    const cancelled = searchParams.get("cancelled") === "true" || location.pathname.includes("/checkout/cancel");
    const isLegacyResultPath = location.pathname.includes("/checkout/success") || location.pathname.includes("/checkout/cancel");

    if (callbackOrderCode || gateway || paymentStatus || verified || cancelled || isLegacyResultPath) {
      setCheckoutResult({
        orderCode: callbackOrderCode,
        gateway,
        paymentStatus,
        verified,
        cancelled,
      });
    }
  }, [callbackOrderCode, location.pathname, searchParams]);

  useEffect(() => {
    if (!hasCheckoutDraft && !hasCheckoutCallback) {
      toast.error("Vui lòng chọn khóa học trước khi thanh toán.");
      navigate("/courses", { replace: true });
    }
  }, [hasCheckoutCallback, hasCheckoutDraft, navigate]);

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
    { label: "Thanh toán", isLast: true },
  ];

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

        let response;
        if (isGift) {
          const requestBody = {
            courseId: orderItems[0]?.id,
            receiverEmail: giftDetails?.receiverEmail,
            message: giftDetails?.message,
            paymentMethod,
            couponCode: appliedCoupon ? couponCode : null,
            returnUrl: `${window.location.origin}/checkout`,
            cancelUrl: `${window.location.origin}/checkout?cancelled=true`
          };
          response = await giftService.createGift(requestBody);
        } else {
          const requestBody = {
            courseId: orderItems[0]?.id,
            productName: orderItems.length === 1 ? orderItems[0].title : `Đơn hàng ${orderItems.length} khóa học`,
            description: `Thanh toan khoa hoc`,
            price: subtotal,
            paymentMethod,
            couponCode: appliedCoupon ? couponCode : null,
            returnUrl: `${window.location.origin}/checkout`,
            cancelUrl: `${window.location.origin}/checkout?cancelled=true`
          };
          response = await orderService.createOrder(requestBody);
        }

        if (response.status === "success" || response.code === "success" || response.data) {
          const paymentData = response.data;
          const checkoutUrl = paymentData.orderCode
            ? `/checkout?orderCode=${paymentData.orderCode}`
            : "/checkout";

          if (paymentData.orderCode) {
            navigate(checkoutUrl, { replace: true, state: { orderItems } });
          }
          toast.success("Tạo đơn hàng thành công!");
          if (paymentData.status === "PAID") {
            setCheckoutResult({
              orderCode: paymentData.orderCode,
              gateway: paymentMethod,
              paymentStatus: "PAID",
              verified: true,
              amount: paymentData.amount,
            });
          } else if (paymentMethod === "VNPAY") {
            if (!paymentData.checkoutUrl) {
              throw new Error("VNPay không trả về đường dẫn thanh toán");
            }
            window.location.assign(paymentData.checkoutUrl);
          } else {
            setPayosDialogData({ paymentData, orderItems });
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

  const handleCheckoutResultOpenChange = (open) => {
    if (open) return;

    const isPaidResult = checkoutResult?.paymentStatus?.toUpperCase() === "PAID";
    setCheckoutResult(null);

    if (isPaidResult) {
      if (isGift) {
        navigate("/account/orders", { replace: true });
      } else {
        navigate("/account/my-courses", { replace: true });
      }
      return;
    }

    if (hasCheckoutDraft) {
      const checkoutUrl = callbackOrderCode ? `/checkout?orderCode=${callbackOrderCode}` : "/checkout";
      navigate(checkoutUrl, { replace: true, state: { orderItems, isGift, giftDetails } });
      return;
    }

    navigate("/account/orders", { replace: true });
  };

  if (!hasCheckoutDraft) {
    return (
      <PageContainer className="pb-20">
        <PageContainer.Content className="min-h-[60vh] gap-y-0 pt-6 md:gap-y-0 md:pt-12">
          <CheckoutResultDialog
            open={checkoutResult != null}
            result={checkoutResult}
            onOpenChange={handleCheckoutResultOpenChange}
          />
        </PageContainer.Content>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-20">
      <PageContainer.Content className="gap-y-0 pt-6 md:gap-y-0 md:pt-12">
        <CheckoutOrderHeader breadcrumbItems={breadcrumbItems} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 xl:gap-12">
            <div className="lg:col-span-8 space-y-6">
              <CheckoutOrderItemList orderItems={orderItems} />
              <CheckoutPaymentMethod
                paymentMethods={PAYMENT_METHODS}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            </div>

            <div className="self-start lg:sticky lg:top-28 lg:col-span-4">
              <div className="space-y-6">
                <CheckoutOrderSummary
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
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <p className="text-center text-xs font-bold text-primary">
                    * Khóa học sẽ được kích hoạt ngay sau khi thanh toán thành công
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <AppDialogRoot
          open={payosDialogData != null && !isPayosCancelConfirmOpen}
          onOpenChange={(open) => {
            if (!open && payosDialogData && !isPayosCancelConfirmOpen) {
              setIsPayosCancelConfirmOpen(true);
            }
          }}
        >
          <AppDialogContent
            appVariant="default"
            className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-5xl"
          >
            <AppDialogHeader className="border-b border-border bg-muted px-6 py-5 pr-16 text-left">
              <AppDialogTitle className="text-left text-xl">
                Thanh toán đơn hàng
                {payosDialogData?.paymentData?.orderCode
                  ? ` #${payosDialogData.paymentData.orderCode}`
                  : ""}
              </AppDialogTitle>
              <AppDialogDescription className="text-sm text-muted-foreground">
                Quét mã QR hoặc chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng.
              </AppDialogDescription>
            </AppDialogHeader>
            <div className="max-h-[calc(92vh-92px)] overflow-y-auto">
              {payosDialogData && (
                <PayosQR
                  embedded
                  paymentData={payosDialogData.paymentData}
                  orderItems={payosDialogData.orderItems}
                  onCancel={() => setIsPayosCancelConfirmOpen(true)}
                  onPaid={(result) => {
                    setPayosDialogData(null);
                    setCheckoutResult(result);
                  }}
                />
              )}
            </div>
          </AppDialogContent>
        </AppDialogRoot>

        <AppAlertDialog
          open={isPayosCancelConfirmOpen}
          onOpenChange={setIsPayosCancelConfirmOpen}
          variant="destructive"
          title="Hủy thanh toán?"
          description="Giao dịch hiện vẫn đang chờ thanh toán. Bạn có chắc chắn muốn đóng mã QR và hủy quá trình này không?"
          cancelText="Tiếp tục thanh toán"
          confirmText="Hủy thanh toán"
          onConfirm={() => {
            setIsPayosCancelConfirmOpen(false);
            setPayosDialogData(null);
          }}
          contentClassName="shadow-none"
        />

        <CheckoutResultDialog
          open={checkoutResult != null}
          result={checkoutResult}
          onOpenChange={handleCheckoutResultOpenChange}
        />
      </PageContainer.Content>
    </PageContainer>
  );
}
