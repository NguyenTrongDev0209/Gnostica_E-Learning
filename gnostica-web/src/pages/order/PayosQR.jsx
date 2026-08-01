import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "stompjs/lib/stomp.js";
import { Card, CardContent } from "@/components/common/micro/AppCard";
import Separator from "@/components/common/micro/AppSeparator";
import { AppButton, AppIconButton } from "@/components/common/micro/AppButton";
import {
  Copy,
  Clock,
  Info,
  ExternalLink,
} from "lucide-react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { toast } from "sonner";
import { payosPaymentMock } from "@/mocks/payment";
import orderService from "@/services/order/orderService";
import PageContainer from "@/components/common/core/PageContainer";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { APP_ENV, WS_URL } from "@/config/environment";

export default function PayosQR({
  embedded = false,
  paymentData: paymentDataProp,
  orderItems: orderItemsProp,
  onCancel,
  onPaid,
}) {
  const { state } = useLocation();
  const [timeLeft, setTimeLeft] = useState(payosPaymentMock.expiresInSeconds);
  const [status, setStatus] = useState("waiting"); // waiting, success, cancelled, paid
  const completionHandledRef = useRef(false);
  const navigate = useNavigate();

  // Dữ liệu đơn hàng từ PayOS truyền qua state
  const paymentData = paymentDataProp || state?.paymentData;
  const orderItems = orderItemsProp || state?.orderItems || [];

  const totalAmount = paymentData?.amount || (orderItems.length > 0
    ? orderItems.reduce((sum, item) => sum + item.price, 0)
    : payosPaymentMock.amount);

  // Ưu tiên mã QR từ PayOS, nếu không có mới dùng VietQR tự tạo
  const dynamicQrCodeUrl = paymentData?.qrCode
    ? (paymentData.qrCode.startsWith("http")
      ? paymentData.qrCode
      : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentData.qrCode)}`)
    : `https://img.vietqr.io/image/${paymentData?.bin || "MB"}-${paymentData?.accountNumber || payosPaymentMock.accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(paymentData?.description || payosPaymentMock.transferContent)}&accountName=${encodeURIComponent(paymentData?.accountName || payosPaymentMock.accountHolder)}`;

  const checkoutPath = paymentData?.orderCode ? `/checkout?orderCode=${paymentData.orderCode}` : "/account/orders";

  const breadcrumbItems = [
    { label: "Thanh toán", href: checkoutPath },
    { label: paymentData?.orderCode ? String(paymentData.orderCode) : "Mã đơn hàng", isLast: true }
  ];

  const completePayment = useCallback(() => {
    if (completionHandledRef.current) return;

    completionHandledRef.current = true;
    setStatus("paid");
    toast.success("Thanh toán thành công! Đang kích hoạt khóa học...");

    setTimeout(() => {
      if (onPaid) {
        onPaid({
          orderCode: paymentData.orderCode,
          gateway: "PAYOS",
          paymentStatus: "PAID",
          verified: true,
          amount: totalAmount,
        });
      } else {
        navigate(`/checkout?orderCode=${paymentData.orderCode}&gateway=PAYOS&paymentStatus=PAID&verified=true`);
      }
    }, 500);
  }, [navigate, onPaid, paymentData?.orderCode, totalAmount]);

  useEffect(() => {
    completionHandledRef.current = false;
  }, [paymentData?.orderCode]);

  // WebSocket là kênh chính ở production: server gửi sự kiện sau khi webhook
  // PayOS được xác thực và giao dịch đã được commit vào database.
  useEffect(() => {
    if (!paymentData?.orderCode || status !== "waiting") return;

    const socket = new SockJS(WS_URL);
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect({}, () => {
      client.subscribe(`/topic/payment-status/${paymentData.orderCode}`, (message) => {
        try {
          const event = JSON.parse(message.body);
          if (String(event.orderCode) === String(paymentData.orderCode) && event.status === "PAID") {
            completePayment();
          }
        } catch (error) {
          console.error("Payment WebSocket message error:", error);
        }
      });
    }, (error) => {
      console.warn("Payment WebSocket unavailable; polling remains active.", error);
    });

    return () => {
      if (client.connected) client.disconnect();
    };
  }, [paymentData?.orderCode, status, completePayment]);

  // Polling là dự phòng nếu WebSocket bị mất. Ở production chỉ đọc trạng thái
  // nội bộ; ở development server sẽ hỏi PayOS vì localhost không nhận webhook.
  useEffect(() => {
    if (!paymentData?.orderCode || status !== "waiting") return;

    let isPolling = true;
    let pollTimeout;

    const checkPaymentStatus = async () => {
      if (!isPolling) return;

      try {
        const response = await orderService.getOrderById(paymentData.orderCode);

        // Ngăn request hoàn thành sau khi component unmount
        if (!isPolling) return;

        // Backend Order entity dùng status số: 0 = PENDING, 1 = PAID
        const currentStatus = response.data?.status;

        if (currentStatus === 1) {
          isPolling = false;
          completePayment();
          return;
        } else if (response.error !== 0) {
          console.error("API Error:", response.message);
        } else if (currentStatus === 2) {
          // status 2 = CANCELLED (nếu có)
          isPolling = false;
          setStatus("cancelled");
          toast.error("Đơn hàng đã bị hủy.");
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      if (isPolling) {
        pollTimeout = setTimeout(checkPaymentStatus, APP_ENV === "development" ? 1000 : 15000);
      }
    };

    checkPaymentStatus();

    return () => {
      isPolling = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [paymentData?.orderCode, status, completePayment]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || status !== "waiting") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const handleCancel = () => {
    setStatus("cancelled");
    if (onCancel) {
      onCancel();
      return;
    }
    navigate(paymentData?.orderCode ? `/checkout?orderCode=${paymentData.orderCode}&cancelled=true` : "/account/orders", {
      replace: true,
      state: { orderItems },
    });
  };

  return (
    <PageContainer className={embedded ? "min-h-0 pb-0" : "pb-20"}>
      <PageContainer.Content
        disableContainer={embedded}
        className={embedded ? "gap-y-0 p-0" : "gap-y-0 pt-6 md:gap-y-0 md:pt-12"}
      >
        {!embedded && (
          <>
            <AppBreadcrumb paths={breadcrumbItems} className="mb-8" />
            <AppPageHeader
              title={`Thanh toán đơn hàng${paymentData?.orderCode ? ` #${paymentData.orderCode}` : ""}`}
              description="Quét mã QR hoặc chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng."
              titleClassName="text-3xl font-bold md:text-4xl"
            />
          </>
        )}

        <Card appVariant="default" className={`mx-auto w-full gap-0 overflow-hidden py-0 shadow-none ${embedded ? "max-w-none border-0" : "max-w-4xl"}`}>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Left: QR Code */}
              <div className="md:col-span-2 p-6 sm:p-8 flex flex-col items-center justify-center bg-muted border-b md:border-b-0 md:border-r border-border">
                {/* QR Image */}
                <div className="h-56 w-56 rounded-xl border border-border bg-white p-3 sm:h-60 sm:w-60">
                  <img
                    src={dynamicQrCodeUrl}
                    alt="QR Code thanh toán"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                {/* Instructions */}
                <p className="text-sm text-muted-foreground text-center mt-5 max-w-[220px] leading-relaxed">
                  Mở App <span className="font-bold text-foreground">Ngân hàng</span> hoặc{" "}
                  <span className="font-bold text-foreground">Ví điện tử</span> để quét mã QR
                </p>

                {/* Browser link */}
                <a
                  href={paymentData?.checkoutUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  Hoặc thanh toán qua trình duyệt
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Countdown */}
                <div className="flex items-center gap-2 mt-5">
                  <Clock className={`w-4 h-4 ${timeLeft <= 60 ? "text-error" : "text-warning"}`} />
                  <span
                    className={`text-lg font-bold tabular-nums ${timeLeft <= 60 ? "text-error" : "text-warning"
                      }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Right: Payment Info */}
              <div className="md:col-span-3 p-6 sm:p-8">
                <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
                  Thanh toán đơn hàng
                </h2>

                {/* Bank Info Rows */}
                <div className="space-y-4">
                  {/* Ngân hàng */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-muted-foreground">Ngân hàng</span>
                    <span className="text-sm font-bold text-foreground">{paymentData?.bin === "970422" ? "MB Bank" : "Ngân hàng đối tác"}</span>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-muted-foreground">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground tracking-wide">
                        {paymentData?.accountNumber || payosPaymentMock.accountNumber}
                      </span>
                      <AppIconButton
                        icon={Copy}
                        aria-label="Sao chép số tài khoản"
                        onClick={() => copyToClipboard(paymentData?.accountNumber || payosPaymentMock.accountNumber, "số tài khoản")}
                        className="!size-8 !bg-accent !text-white shadow-none hover:!bg-accent/90 hover:!text-white"
                      />
                    </div>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Chủ tài khoản */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-muted-foreground">Chủ tài khoản</span>
                    <span className="text-sm font-bold text-foreground">
                      {paymentData?.accountName || payosPaymentMock.accountHolder}
                    </span>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Số tiền */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-muted-foreground">Số tiền</span>
                    <span className="text-gradient-button text-lg font-bold">
                      {totalAmount.toLocaleString()}{" "}
                      <span className="text-sm font-bold">VNĐ</span>
                    </span>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Nội dung */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-normal text-muted-foreground">Nội dung</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {paymentData?.description || payosPaymentMock.transferContent}
                      </span>
                      <AppIconButton
                        icon={Copy}
                        aria-label="Sao chép nội dung chuyển khoản"
                        onClick={() => copyToClipboard(paymentData?.description || payosPaymentMock.transferContent, "nội dung")}
                        className="!size-8 !bg-accent !text-white shadow-none hover:!bg-accent/90 hover:!text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-warning-soft border border-warning/20 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    Vui lòng nhập chính xác{" "}
                    <span className="font-bold">Nội dung chuyển khoản</span> để đơn hàng được
                    duyệt tự động.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <AppButton
                    appVariant="accent"
                    onClick={handleCancel}
                    className="h-12 flex-1 rounded-xl border border-error bg-error font-bold text-error-foreground hover:bg-error/90 hover:text-error-foreground"
                  >
                    Hủy thanh toán
                  </AppButton>
                  <AppButton
                    appVariant="ghostMuted"
                    type="button"
                    aria-disabled="true"
                    tabIndex={-1}
                    className="pointer-events-none h-12 flex-1 gap-2 rounded-xl border border-warning bg-transparent font-bold text-warning opacity-100"
                  >
                    <span className="relative flex size-3" aria-hidden="true">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-75" />
                      <span className="relative inline-flex size-3 rounded-full bg-warning" />
                    </span>
                    Đang chờ thanh toán
                  </AppButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer.Content>
    </PageContainer>
  );
}
