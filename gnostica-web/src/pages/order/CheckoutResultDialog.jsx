import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, FileText, Loader2, RotateCcw, ShoppingBag, X } from "lucide-react";
import { checkoutStatusConfig } from "@/mocks/checkout";
import orderService from "@/services/order/orderService";
import Separator from "@/components/common/micro/AppSeparator";
import { AppButton, Button } from "@/components/common/micro/AppButton";
import {
  AppDialogContent,
  AppDialogDescription,
  AppDialogHeader,
  AppDialogRoot,
  AppDialogTitle,
} from "@/components/common/micro/AppDialog";

const MAX_STATUS_CHECKS = 15;
const STATUS_CHECK_INTERVAL_MS = 1500;

export default function CheckoutResultDialog({ open, onOpenChange, result }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusChecksFinished, setStatusChecksFinished] = useState(false);

  const orderCode = result?.orderCode;
  const callbackStatus = result?.paymentStatus?.toUpperCase();
  const callbackVerified = result?.verified === "true" || result?.verified === true;
  const returnWasCancelled = result?.cancelled === true || callbackStatus === "CANCELLED";
  const returnWasFailed = callbackVerified && ["FAILED", "CANCELLED", "INVALID"].includes(callbackStatus);
  const hasTerminalReturnStatus = returnWasCancelled || returnWasFailed;

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    let timeoutId;

    const checkOrder = async (attempt = 0) => {
      if (!orderCode || !active) {
        setLoading(false);
        setStatusChecksFinished(true);
        return;
      }

      setLoading(true);
      try {
        const response = await orderService.getOrderById(orderCode);
        if (!active) return;

        const nextOrder = response?.data;
        setOrder(nextOrder || null);
        setLoading(false);

        if (
          nextOrder?.status === 1 ||
          nextOrder?.status === 3 ||
          nextOrder?.status === 2 ||
          hasTerminalReturnStatus ||
          attempt >= MAX_STATUS_CHECKS - 1
        ) {
          setStatusChecksFinished(true);
          return;
        }
      } catch (error) {
        console.error("Khong the kiem tra trang thai don hang:", error);
        setLoading(false);
        if (hasTerminalReturnStatus || attempt >= MAX_STATUS_CHECKS - 1) {
          setStatusChecksFinished(true);
          return;
        }
      }

      if (active && !hasTerminalReturnStatus && attempt < MAX_STATUS_CHECKS - 1) {
        timeoutId = window.setTimeout(() => checkOrder(attempt + 1), STATUS_CHECK_INTERVAL_MS);
      } else {
        setStatusChecksFinished(true);
      }
    };

    setOrder(null);
    setStatusChecksFinished(false);
    checkOrder();

    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [open, orderCode, hasTerminalReturnStatus]);

  const isPaid = order?.status === 1 || callbackStatus === "PAID";
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
      : "Đơn hàng chưa được thanh toán. Bạn có thể quay lại và thử lại.";

  return (
    <AppDialogRoot open={open} onOpenChange={onOpenChange}>
      <AppDialogContent appVariant="default" className="w-[calc(100vw-32px)] max-w-[520px] overflow-hidden p-0">
        <AppDialogHeader className="sr-only">
          <AppDialogTitle>Kết quả thanh toán</AppDialogTitle>
          <AppDialogDescription>{description}</AppDialogDescription>
        </AppDialogHeader>

        <div className="flex max-h-[92vh] flex-col items-center overflow-y-auto p-6 text-center sm:p-8">
          {loading && !order ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 className="size-10 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className={`mb-6 flex size-20 items-center justify-center rounded-full ${isPending ? "bg-warning/10" : config.iconBg} ring-8 ${isPending ? "ring-warning/10" : config.ringColor}`}>
                <StatusIcon className={`size-10 ${isPending ? "text-warning" : config.iconColor} ${isPending && !statusChecksFinished ? "animate-pulse" : ""}`} />
              </div>

              <h2 className="mb-2 text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h2>
              <p className="mb-8 max-w-sm text-sm text-muted-foreground">{description}</p>

              <div className="mb-7 w-full space-y-3 rounded-xl bg-muted p-5 text-left">
                <Detail label="Mã đơn hàng" value={`#${orderCode || order?.id || "N/A"}`} />
                <Separator className="bg-muted/70" />
                <Detail
                  label="Tổng tiền"
                  value={`${Number(order?.totalPrice || result?.amount || 0).toLocaleString("vi-VN")}đ`}
                  valueClass="text-gradient-button font-black"
                />
                <Separator className="bg-muted/70" />
                <Detail label="Phương thức" value={formatPaymentMethod(order?.paymentMethod || result?.gateway)} />
                <Separator className="bg-muted/70" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">Trạng thái</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isPaid ? "bg-success/10 text-success" : isPending ? "bg-warning/10 text-warning" : config.badgeColor}`}>
                    {isPaid ? "ĐÃ THANH TOÁN" : isPending ? "ĐANG XÁC NHẬN" : "CHƯA THANH TOÁN"}
                  </span>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row">
                {isPaid ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="h-12 flex-1 gap-2 rounded-xl font-bold"
                    >
                      <X className="size-4" />
                      Đóng
                    </Button>
                    <ActionLink to="/account/my-courses" icon={ArrowRight} label="Vào học ngay" />
                  </>
                ) : (
                  <>
                    <ActionLink to="/account/orders" icon={FileText} label="Xem đơn hàng" outline />
                    <Button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      className="h-12 flex-1 gap-2 rounded-xl font-bold"
                    >
                      {hasTerminalReturnStatus ? <RotateCcw className="size-4" /> : <ShoppingBag className="size-4" />}
                      {hasTerminalReturnStatus ? "Thử lại" : "Tiếp tục mua sắm"}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </AppDialogContent>
    </AppDialogRoot>
  );
}

function Detail({ label, value, valueClass = "font-bold text-foreground" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-right text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}

function ActionLink({ to, icon, label, outline = false }) {
  return (
    <Link to={to} className="flex-1">
      {outline ? (
        <Button variant="outline" className="h-12 w-full gap-2 rounded-xl font-bold">
          {React.createElement(icon, { className: "size-4" })}
          {label}
        </Button>
      ) : (
        <AppButton appVariant="gradient" className="h-12 w-full gap-2 rounded-xl font-bold">
          {label}
          {React.createElement(icon, { className: "size-4" })}
        </AppButton>
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
