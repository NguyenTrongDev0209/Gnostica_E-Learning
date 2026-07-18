import { CheckCircle2, XCircle, CreditCard, QrCode } from "lucide-react";

export const paymentMethodsMock = [
  {
    id: "PAYOS",
    label: "PayOS",
    description: "QR Code hoặc chuyển khoản ngân hàng",
    icon: QrCode,
    color: "text-success bg-green-50",
  },
  {
    id: "VNPAY",
    label: "VNPay",
    description: "Thẻ ATM, tài khoản ngân hàng hoặc QR",
    icon: CreditCard,
    color: "text-info bg-blue-50",
  },
];

export const checkoutOrderInfoMock = {
  orderCode: "#71",
  amount: "1.398.000đ",
  method: "QR Code - MB Bank",
  date: "24/03/2026 – 21:15",
  email: "minhle@example.com",
};

export const checkoutStatusConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-success",
    iconBg: "bg-green-50",
    ringColor: "ring-green-100",
    title: "Thanh toán thành công!",
    description: "Đơn hàng đã được xác nhận và khóa học đã được kích hoạt.",
    badgeText: "Đã thanh toán",
    badgeColor: "bg-success/10 text-success",
  },
  cancel: {
    icon: XCircle,
    iconColor: "text-error",
    iconBg: "bg-red-50",
    ringColor: "ring-red-100",
    title: "Thanh toán chưa hoàn tất",
    description: "Đơn hàng chưa được thanh toán. Bạn có thể quay lại và thử lại.",
    badgeText: "Chưa thanh toán",
    badgeColor: "bg-error/10 text-error",
  },
};
