import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  FileText,
} from "lucide-react";
import { SimpleButton } from "@/components/common/AppButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumb } from "@/components/common/AppSection";
import { checkoutOrderInfoMock, checkoutStatusConfig } from "@/mocks/checkout";

export default function CheckoutResult() {
  const location = useLocation();
  const isSuccess = location.pathname.includes("success");
  const config = isSuccess ? checkoutStatusConfig.success : checkoutStatusConfig.cancel;
  const Icon = config.icon;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Thanh toán", href: "/checkout" },
    { label: isSuccess ? "Thành công" : "Đã hủy", isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="bg-slate-900 py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb 
            items={breadcrumbItems} 
            linkClassName="text-slate-400 hover:text-slate-100"
            activeClassName="font-semibold text-slate-200"
            separatorClassName="text-slate-500"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Kết quả thanh toán
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <main className="app-container max-w-2xl mt-[-40px]">
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center ring-8 ${config.ringColor} mb-6`}>
              <Icon className={`w-10 h-10 ${config.iconColor}`} />
            </div>

            {/* Status Title */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {config.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              {config.description}
            </p>

            {/* Order Details */}
            <div className="w-full bg-slate-50 rounded-xl p-5 sm:p-6 text-left space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Mã đơn hàng</span>
                <span className="text-sm font-bold text-slate-800">{checkoutOrderInfoMock.orderCode}</span>
              </div>
              <Separator className="bg-slate-200/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Tổng tiền</span>
                <span className="text-sm font-black text-primary">{checkoutOrderInfoMock.amount}</span>
              </div>
              <Separator className="bg-slate-200/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Phương thức</span>
                <span className="text-sm font-bold text-slate-800">{checkoutOrderInfoMock.method}</span>
              </div>
              <Separator className="bg-slate-200/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Thời gian</span>
                <span className="text-sm font-bold text-slate-800">{checkoutOrderInfoMock.date}</span>
              </div>
              <Separator className="bg-slate-200/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Trạng thái</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.badgeColor}`}>
                  {config.badgeText}
                </span>
              </div>
            </div>

            {/* Actions */}
            {isSuccess ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link to="/account/orders" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full h-12 font-bold gap-2 border-slate-200 hover:bg-slate-50 rounded-xl"
                  >
                    <FileText className="w-4 h-4" />
                    Xem đơn hàng
                  </Button>
                </Link>
                <Link to="/courses" className="flex-1">
                  <SimpleButton className="w-full h-12 font-bold gap-2 rounded-xl">
                    Tiếp tục học
                    <ArrowRight className="w-4 h-4" />
                  </SimpleButton>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link to="/cart" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full h-12 font-bold gap-2 border-slate-200 hover:bg-slate-50 rounded-xl"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Về giỏ hàng
                  </Button>
                </Link>
                <Link to="/checkout" className="flex-1">
                  <SimpleButton className="w-full h-12 font-bold gap-2 rounded-xl">
                    <RotateCcw className="w-4 h-4" />
                    Thử thanh toán lại
                  </SimpleButton>
                </Link>
              </div>
            )}

            {/* Confirmation email note */}
            {isSuccess && (
              <p className="text-xs text-muted-foreground mt-6">
                Email xác nhận đã được gửi đến <span className="font-bold text-slate-700">{checkoutOrderInfoMock.email}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
