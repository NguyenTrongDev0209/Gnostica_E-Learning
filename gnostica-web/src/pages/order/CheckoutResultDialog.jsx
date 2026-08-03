import { useEffect, useState } from "react";
import { Check, CircleX, Clock3, Loader2 } from "lucide-react";
import orderService from "@/services/order/orderService";
import AppAlertDialog from "@/components/common/micro/AppAlertDialog";
import {
  AppDialogContent,
  AppDialogDescription,
  AppDialogHeader,
  AppDialogRoot,
  AppDialogTitle,
} from "@/components/common/micro/AppDialog";

const MAX_STATUS_CHECKS = 15;
const STATUS_CHECK_INTERVAL_MS = 1500;

export default function CheckoutResultDialog({ open, onOpenChange, onResultAction, result }) {
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
          nextOrder?.status === 2 ||
          nextOrder?.status === 3 ||
          hasTerminalReturnStatus ||
          attempt >= MAX_STATUS_CHECKS - 1
        ) {
          setStatusChecksFinished(true);
          return;
        }
      } catch (error) {
        console.error("Không thể kiểm tra trạng thái đơn hàng:", error);
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

  // URL parameters are navigation hints only. The persisted order status remains
  // the source of truth for whether the learner has successfully paid.
  const isPaid = order?.status === 1;
  const isCancelled = order?.status === 3 || returnWasCancelled || (callbackVerified && callbackStatus === "FAILED");
  const isPending = !isPaid && order?.status === 0 && !hasTerminalReturnStatus;
  const state = isPaid ? "success" : isPending ? "warning" : "destructive";
  const Icon = isPaid ? Check : isPending ? Clock3 : CircleX;
  const completedAt = formatDateTime(order?.updatedAt);

  const title = isPaid
    ? "Thanh toán thành công"
    : isPending
      ? "Đang xác nhận thanh toán"
      : isCancelled
        ? "Đã hủy thanh toán"
      : "Thanh toán chưa hoàn tất";
  const description = isPaid
    ? `Chúc mừng! Bạn đã hoàn tất thanh toán vào ${completedAt}.`
    : isPending
      ? statusChecksFinished
        ? "Giao dịch vẫn đang được xử lý. Bạn có thể xem lại trong lịch sử đơn hàng."
        : "Hệ thống đang chờ xác nhận an toàn từ cổng thanh toán."
      : isCancelled
        ? `Giao dịch đã được hủy vào thời điểm ${completedAt}.`
        : "Đơn hàng chưa được thanh toán. Bạn có thể mua lại khi sẵn sàng.";

  const handleViewOrders = () => {
    onResultAction?.("/account/my-courses");
    onOpenChange(false);
  };

  const handleRepurchase = () => {
    onResultAction?.("/courses");
    onOpenChange(false);
  };

  if (loading && !order) {
    return (
      <AppDialogRoot open={open} onOpenChange={onOpenChange}>
        <AppDialogContent appVariant="default" showCloseButton={false} className="w-[calc(100vw-32px)] max-w-[390px] rounded-2xl p-6">
          <AppDialogHeader className="sr-only">
            <AppDialogTitle>Đang kiểm tra thanh toán</AppDialogTitle>
            <AppDialogDescription>Vui lòng chờ trong giây lát.</AppDialogDescription>
          </AppDialogHeader>
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-9 animate-spin text-primary" />
          </div>
        </AppDialogContent>
      </AppDialogRoot>
    );
  }

  return (
    <AppAlertDialog
      open={open}
      onOpenChange={onOpenChange}
      variant={state}
      layout="centered"
      icon={<Icon className={`size-6 text-white ${isPending && !statusChecksFinished ? "animate-pulse" : ""}`} />}
      mediaClassName={isPaid ? "!bg-success !ring-0" : isPending ? "!bg-warning !ring-0" : "!bg-error !ring-0"}
      title={title}
      description={description}
      hideCancel={isPending}
      cancelText="Đóng"
      confirmText={isPaid ? "Xem khóa học" : isPending ? "Đóng" : "Mua lại"}
      onConfirm={isPaid ? handleViewOrders : isPending ? () => onOpenChange(false) : handleRepurchase}
    />
  );
}

function formatDateTime(value) {
  if (!value) return "không xác định";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "không xác định";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
