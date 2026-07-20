import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

export default function PayosQR() {
  const { state } = useLocation();
  const [timeLeft, setTimeLeft] = useState(payosPaymentMock.expiresInSeconds);
  const [status, setStatus] = useState("waiting"); // waiting, success, cancelled, paid
  const navigate = useNavigate();

  // Dữ liệu đơn hàng từ PayOS truyền qua state
  const paymentData = state?.paymentData;
  const orderItems = state?.orderItems || [];

  const totalAmount = paymentData?.amount || (orderItems.length > 0
    ? orderItems.reduce((sum, item) => sum + item.price, 0)
    : payosPaymentMock.amount);

  // Ưu tiên mã QR từ PayOS, nếu không có mới dùng VietQR tự tạo
  const dynamicQrCodeUrl = paymentData?.qrCode
    ? (paymentData.qrCode.startsWith("http")
      ? paymentData.qrCode
      : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentData.qrCode)}`)
    : `https://img.vietqr.io/image/${paymentData?.bin || "MB"}-${paymentData?.accountNumber || payosPaymentMock.accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(paymentData?.description || payosPaymentMock.transferContent)}&accountName=${encodeURIComponent(paymentData?.accountName || payosPaymentMock.accountHolder)}`;

  const breadcrumbItems = [
    { label: "Thanh toán", href: "/checkout" },
    { label: paymentData?.orderCode ? String(paymentData.orderCode) : "Mã đơn hàng", isLast: true }
  ];

  // Cơ chế Polling kiểm tra trạng thái thanh toán
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
          setStatus("paid");
          toast.success("Thanh toán thành công! Đang kích hoạt khóa học...");

          // Chuyển hướng sang trang kết quả kèm orderCode để hiển thị chi tiết
          setTimeout(() => {
            navigate(`/checkout/success?orderCode=${paymentData.orderCode}`);
          }, 500);
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
        pollTimeout = setTimeout(checkPaymentStatus, 1000);
      }
    };

    checkPaymentStatus();

    return () => {
      isPolling = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [paymentData?.orderCode, status, navigate]);

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
    navigate("/checkout", {
      replace: true,
      state: { orderItems },
    });
  };

  return (
    <PageContainer className="pb-20">
      <PageContainer.Content className="gap-y-0 pt-6 md:gap-y-0 md:pt-12">
        <AppBreadcrumb paths={breadcrumbItems} className="mb-8" />
        <AppPageHeader
          title={`Thanh toán đơn hàng${paymentData?.orderCode ? ` #${paymentData.orderCode}` : ""}`}
          description="Quét mã QR hoặc chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng."
          titleClassName="text-3xl font-bold md:text-4xl"
        />

        <Card appVariant="default" className="mx-auto max-w-4xl gap-0 overflow-hidden py-0 shadow-none">
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
                        className="!size-8 !bg-transparent !text-muted-foreground shadow-none hover:!bg-primary/5 hover:!text-primary"
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
                        className="!size-8 !bg-transparent !text-muted-foreground shadow-none hover:!bg-primary/5 hover:!text-primary"
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
                    appVariant="ghostMuted"
                    onClick={handleCancel}
                    className="h-12 flex-1 rounded-xl border border-error/20 font-bold text-error hover:bg-error-soft hover:text-error"
                  >
                    Hủy thanh toán
                  </AppButton>
                  <AppButton
                    appVariant="ghostMuted"
                    disabled
                    className="h-12 flex-1 gap-2 rounded-xl border border-warning/20 bg-warning-soft font-bold text-warning"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-warning/10 text-warning animate-pulse" />
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
