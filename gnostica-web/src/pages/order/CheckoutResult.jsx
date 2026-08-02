import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/common/micro/AppCard";
import { Home, ShoppingBag, ArrowRight, RotateCcw, FileText, Loader2, Clock3 } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import { Button } from "@/components/common/micro/AppButton";
import Separator from "@/components/common/micro/AppSeparator";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { checkoutStatusConfig } from "@/mocks/checkout";
import orderService from "@/services/order/orderService";
import PageContainer from "@/components/common/core/PageContainer";

const MAX_STATUS_CHECKS = 15;
const STATUS_CHECK_INTERVAL_MS = 1500;

export default function CheckoutResult() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusChecksFinished, setStatusChecksFinished] = useState(false);
  const orderCode = searchParams.get("orderCode");
  const callbackStatus = searchParams.get("paymentStatus")?.toUpperCase();
  const callbackVerified = searchParams.get("verified") === "true";
  const returnWasCancelled = location.pathname.includes("cancel");
  const returnWasFailed = callbackVerified && ["FAILED", "CANCELLED"].includes(callbackStatus);
  const hasTerminalReturnStatus = returnWasCancelled || returnWasFailed;

  useEffect(() => {
    let active = true;
    let timeoutId;

    const checkOrder = async (attempt = 0) => {
      if (!orderCode || !active) {
        setLoading(false);
        setStatusChecksFinished(true);
        return;
      }
      try {
        const response = await orderService.getOrderById(orderCode);
        if (!active) return;
        const nextOrder = response?.data;
        setLoading(false);
        if (nextOrder) {
          setOrder(nextOrder);
          if (nextOrder.status === 1 || nextOrder.status === 3 || hasTerminalReturnStatus || attempt >= MAX_STATUS_CHECKS - 1) {
            setStatusChecksFinished(true);
            return;
          }
        } else if (hasTerminalReturnStatus) {
          setStatusChecksFinished(true);
          return;
        }
      } catch (error) {
        console.error("Không thể kiểm tra trạng thái đơn hàng:", error);
        setLoading(false);
      }

      if (attempt < MAX_STATUS_CHECKS - 1 && active && !hasTerminalReturnStatus) {
        timeoutId = window.setTimeout(() => checkOrder(attempt + 1), STATUS_CHECK_INTERVAL_MS);
      } else {
        setStatusChecksFinished(true);
      }
    };

    checkOrder();
    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [orderCode, hasTerminalReturnStatus]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const isPaid = order?.status === 1;
  const isPending = !isPaid && order?.status === 0 && !hasTerminalReturnStatus;
  const config = isPaid ? checkoutStatusConfig.success : checkoutStatusConfig.cancel;
  const StatusIcon = isPending ? Clock3 : config.icon;
  const title = isPaid
    ? "Thanh toán thành công!"
    : isPending
      ? "Đang xác nhận thanh toán"
      : "Thanh toán chưa hoàn tất";
  const description = isPaid
    ? "Đơn hàng đã được xử lý và khóa học đã sẵn sàng."
    : isPending
      ? statusChecksFinished
        ? "Giao dịch vẫn đang được xử lý. Bạn có thể xem lại trạng thái trong lịch sử mua hàng."
        : "Hệ thống đang chờ xác nhận an toàn từ cổng thanh toán."
      : config.description;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Thanh toán", href: "/checkout" },
    { label: title, isLast: true },
  ];

  return (
    <PageContainer className="pb-20">
      <section className="bg-muted py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb paths={breadcrumbItems} />
          <h1 className="text-3xl md:text-4xl font-extrabold">Kết quả thanh toán</h1>
        </div>
      </section>

      <main className="app-container max-w-2xl mt-[-40px]">
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full ${isPending ? "bg-warning/10" : config.iconBg} flex items-center justify-center ring-8 ${isPending ? "ring-warning/10" : config.ringColor} mb-6`}>
              <StatusIcon className={`w-10 h-10 ${isPending ? "text-warning" : config.iconColor} ${isPending && !statusChecksFinished ? "animate-pulse" : ""}`} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">{description}</p>

            <div className="w-full bg-muted rounded-xl p-5 sm:p-6 text-left space-y-3 mb-8">
              <Detail label="Mã đơn hàng" value={`#${orderCode || order?.id || "N/A"}`} />
              <Separator className="bg-muted/70" />
              <Detail label="Tổng tiền" value={`${Number(order?.totalPrice || 0).toLocaleString("vi-VN")}đ`} valueClass="text-primary font-black" />
              <Separator className="bg-muted/70" />
              <Detail label="Phương thức" value={formatPaymentMethod(order?.paymentMethod)} />
              <Separator className="bg-muted/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPaid ? "bg-success/10 text-success" : isPending ? "bg-warning/10 text-warning" : config.badgeColor}`}>
                  {isPaid ? "ĐÃ THANH TOÁN" : isPending ? "ĐANG XÁC NHẬN" : "CHƯA THANH TOÁN"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {isPaid ? (
                <>
                  <ActionLink to="/account/orders" icon={FileText} label="Lịch sử mua hàng" outline />
                  <ActionLink to="/account/my-courses" icon={ArrowRight} label="Vào học ngay" />
                </>
              ) : (
                <>
                  <ActionLink to="/account/orders" icon={FileText} label="Xem đơn hàng" outline />
                  <ActionLink to="/checkout" icon={hasTerminalReturnStatus ? RotateCcw : ShoppingBag} label={hasTerminalReturnStatus ? "Thử lại" : "Tiếp tục mua sắm"} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </PageContainer>
  );
}

function Detail({ label, value, valueClass = "font-bold text-foreground" }) {
  return <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={`text-sm ${valueClass}`}>{value}</span></div>;
}

function ActionLink({ to, icon, label, outline = false }) {
  return (
    <Link to={to} className="flex-1">
      {outline ? (
        <Button variant="outline" className="w-full h-12 font-bold gap-2 rounded-xl">{React.createElement(icon, { className: "w-4 h-4" })}{label}</Button>
      ) : (
        <AppButton appVariant="gradient" className="w-full h-12 font-bold gap-2 rounded-xl">{label}{React.createElement(icon, { className: "w-4 h-4" })}</AppButton>
      )}
    </Link>
  );
}

function formatPaymentMethod(method) {
  if (method === "VNPAY") return "VNPay";
  if (method === "PAYOS") return "PayOS (QR/chuyển khoản)";
  if (method === "FREE/COUPON") return "Miễn phí / mã giảm giá";
  return method || "N/A";
}
