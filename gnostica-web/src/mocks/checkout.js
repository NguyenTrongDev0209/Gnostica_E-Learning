import { CheckCircle2, XCircle, CreditCard, Wallet, QrCode, Building2 } from "lucide-react";

export const paymentMethodsMock = [
  {
    id: "credit-card",
    label: "Thẻ tín dụng / Ghi nợ",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: "e-wallet",
    label: "Ví điện tử",
    description: "MoMo, ZaloPay, VNPay",
    icon: Wallet,
    color: "text-pink-600 bg-pink-50",
  },
  {
    id: "qr-code",
    label: "QR Code",
    description: "Quét mã để thanh toán",
    icon: QrCode,
    color: "text-green-600 bg-green-50",
  },
  {
    id: "bank-transfer",
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản trực tiếp",
    icon: Building2,
    color: "text-amber-600 bg-amber-50",
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
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    ringColor: "ring-green-100",
    title: "Thanh toán thành công!",
    description: "Đơn hàng của bạn đã được xác nhận. Khóa học sẽ được kích hoạt ngay lập tức.",
    badgeText: "Đã thanh toán",
    badgeColor: "bg-green-100 text-green-700",
  },
  cancel: {
    icon: XCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    ringColor: "ring-red-100",
    title: "Thanh toán đã bị hủy",
    description: "Đơn hàng của bạn chưa được thanh toán. Các khóa học vẫn còn trong giỏ hàng.",
    badgeText: "Đã hủy",
    badgeColor: "bg-red-100 text-red-700",
  },
};
