import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Clock,
  Info,
  ExternalLink,
  Home,
  CheckCircle2,
} from "lucide-react";
import { AppBreadcrumb } from "@/components/common/AppSection";
import { toast } from "sonner";
import { payosPaymentMock } from "@/apiMocks/payment";
import orderService from "@/services/order/orderService";

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
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Thanh toán", href: "/checkout" },
    { label: "PayOS QR", isLast: true }
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
    setTimeout(() => navigate("/cart"), 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="bg-muted py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb
            items={breadcrumbItems}
            linkClassName="text-muted-foreground hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-muted-foreground"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
            Thanh toán đơn hàng {paymentData?.orderCode ? `#${paymentData.orderCode}` : ""}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Quét mã QR hoặc chuyển khoản theo thông tin bên dưới để hoàn tất đơn hàng.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="app-container mt-[-40px]">
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-5">
              {/* Left: QR Code */}
              <div className="md:col-span-2 p-6 sm:p-8 flex flex-col items-center justify-center bg-muted border-b md:border-b-0 md:border-r border-border">
                {/* QR Image */}
                <div className="w-56 h-56 sm:w-60 sm:h-60 bg-white rounded-2xl shadow-lg p-3 border border-border">
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
                  className="text-sm text-primary hover:underline font-medium mt-3 flex items-center gap-1"
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
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground mb-6">
                  Thanh toán đơn hàng
                </h2>

                {/* Bank Info Rows */}
                <div className="space-y-4">
                  {/* Ngân hàng */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Ngân hàng</span>
                    <span className="text-sm font-bold text-foreground">{paymentData?.bin === "970422" ? "MB Bank" : "Ngân hàng đối tác"}</span>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground tracking-wide">
                        {paymentData?.accountNumber || payosPaymentMock.accountNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(paymentData?.accountNumber || payosPaymentMock.accountNumber, "số tài khoản")}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/5"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Chủ tài khoản */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Chủ tài khoản</span>
                    <span className="text-sm font-bold text-foreground">
                      {paymentData?.accountName || payosPaymentMock.accountHolder}
                    </span>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Số tiền */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Số tiền</span>
                    <span className="text-lg font-black text-primary">
                      {totalAmount.toLocaleString()}{" "}
                      <span className="text-sm font-bold">VNĐ</span>
                    </span>
                  </div>

                  <Separator className="bg-secondary" />

                  {/* Nội dung */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-medium">Nội dung</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {paymentData?.description || payosPaymentMock.transferContent}
                      </span>
                      <button
                        onClick={() => copyToClipboard(paymentData?.description || payosPaymentMock.transferContent, "nội dung")}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/5"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Vui lòng nhập chính xác{" "}
                    <span className="font-bold">Nội dung chuyển khoản</span> để đơn hàng được
                    duyệt tự động.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 h-12 text-error border-error/20 hover:bg-red-50 hover:text-error font-bold rounded-xl"
                  >
                    Hủy thanh toán
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1 h-12 font-bold rounded-xl border-warning/20 text-warning bg-orange-50/50 gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-warning/10 text-warning animate-pulse" />
                    Đang chờ thanh toán
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
