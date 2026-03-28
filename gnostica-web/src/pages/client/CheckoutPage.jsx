import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ChevronRight,
  Wallet,
  QrCode,
  Building2,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SimpleButton } from "@/components/common/AppButton";
import { AppBreadcrumb } from "@/components/common/AppSection";

// Mock order data (from cart)
const ORDER_ITEMS = [
  {
    id: 1,
    title: "Fullstack Next.js Masterclass",
    instructor: "Sonny Sangha",
    price: 899000,
    originalPrice: 1799000,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Ultimate React Query Course",
    instructor: "Maximilian Schwarzmüller",
    price: 499000,
    originalPrice: 999000,
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=200&auto=format&fit=crop",
  },
];

const PAYMENT_METHODS = [
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

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);

  const subtotal = ORDER_ITEMS.reduce((sum, item) => sum + item.price, 0);
  const totalOriginal = ORDER_ITEMS.reduce((sum, item) => sum + item.originalPrice, 0);
  const discount = totalOriginal - subtotal;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Thanh toán", isLast: true }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb 
            items={breadcrumbItems} 
            linkClassName="text-slate-400 hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-slate-500"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Thanh toán
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Hoàn tất đơn hàng của bạn một cách an toàn và nhanh chóng.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="app-container mt-[-40px]">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Step 1: Customer Info */}
              <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    Thông tin khách hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                        Họ và tên
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          placeholder="Nguyễn Văn A"
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                        Số điện thoại
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="0912 345 678"
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                        Địa chỉ
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="Quận 1, TP. Hồ Chí Minh"
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Payment Method */}
              <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
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
                    {PAYMENT_METHODS.map((method) => {
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
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }
                          `}
                        >
                          <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${method.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800">{method.label}</p>
                            <p className="text-xs text-muted-foreground">{method.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>

                  {/* Conditional: Card details */}
                  {paymentMethod === "credit-card" && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-5 animate-in fade-in duration-300">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-700">
                          Số thẻ
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="expiry" className="text-sm font-medium text-slate-700">
                            Ngày hết hạn
                          </Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="cvv" className="text-sm font-medium text-slate-700">
                            CVV
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="cvv"
                              placeholder="•••"
                              maxLength={4}
                              className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="cardName" className="text-sm font-medium text-slate-700">
                          Tên trên thẻ
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="NGUYEN VAN A"
                          className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors uppercase"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">SSL bảo mật</p>
                    <p className="text-slate-500">Mã hóa 256-bit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Bảo vệ dữ liệu</p>
                    <p className="text-slate-500">Không lưu thông tin thẻ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Hoàn tiền 30 ngày</p>
                    <p className="text-slate-500">Đảm bảo chất lượng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <Card className="border-none shadow-2xl shadow-orange-500/10 overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-900">
                      Đơn hàng của bạn
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {/* Order Items */}
                    <div className="space-y-4">
                      {ORDER_ITEMS.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground italic">
                              {item.instructor}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-primary">
                              {item.price.toLocaleString()}đ
                            </p>
                            <p className="text-[10px] text-slate-400 line-through">
                              {item.originalPrice.toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Pricing */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm font-medium text-slate-500">
                        <span>Tạm tính ({ORDER_ITEMS.length} khóa học)</span>
                        <span>{totalOriginal.toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-500">Giảm giá</span>
                        <span className="text-red-500">-{discount.toLocaleString()}đ</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-slate-500">
                        <span>Phí xử lý</span>
                        <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50 font-bold">
                          MIỄN PHÍ
                        </Badge>
                      </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    {/* Total */}
                    <div className="flex justify-between items-end pt-1">
                      <span className="font-bold text-slate-900">Tổng thanh toán</span>
                      <div className="text-right">
                        <div className="text-3xl font-black text-primary leading-none">
                          {subtotal.toLocaleString()}đ
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                          đã bao gồm thuế
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                      <SimpleButton
                        type="submit"
                        className="w-full py-7 text-lg font-black tracking-wide gap-2"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? (
                          <svg
                            className="animate-spin w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                        {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN THANH TOÁN"}
                      </SimpleButton>
                    </div>

                    <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                      Bằng việc nhấn "Xác nhận thanh toán", bạn đồng ý với{" "}
                      <Link to="/terms" className="text-primary hover:underline font-medium">
                        điều khoản dịch vụ
                      </Link>{" "}
                      của chúng tôi.
                    </p>
                  </CardContent>
                </Card>

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
