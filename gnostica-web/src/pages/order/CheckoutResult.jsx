import React, { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  FileText,
  Loader2,
} from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { checkoutStatusConfig } from "@/mocks/checkout";
import orderService from "@/services/order/orderService";

export default function CheckoutResult() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderCode = searchParams.get("orderCode");
  const isSuccess = location.pathname.includes("success") || searchParams.get("status") === "PAID";

  const config = isSuccess ? checkoutStatusConfig.success : checkoutStatusConfig.cancel;
  const Icon = config.icon;

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderCode) {
        try {
          const response = await orderService.getOrderById(orderCode);
          if (response.error === 0 || response.data) {
            setOrder(response.data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderCode]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Thanh toán", href: "/checkout" },
    { label: isSuccess ? "Thành công" : "Đã hủy", isLast: true }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <section className="bg-muted py-12 text-white">
        <div className="app-container">
          <AppBreadcrumb
            paths={breadcrumbItems}
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-2">
              {order?.status === 1 ? "Thanh toán thành công!" : config.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-8">
              {order?.status === 1
                ? "Cảm ơn bạn đã tin tưởng Gnostica. Đơn hàng của bạn đã được xử lý và khóa học đã sẵn sàng."
                : config.description}
            </p>

            {/* Order Details */}
            <div className="w-full bg-muted rounded-xl p-5 sm:p-6 text-left space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mã đơn hàng</span>
                <span className="text-sm font-bold text-foreground">#{orderCode || order?.id || "N/A"}</span>
              </div>
              <Separator className="bg-muted/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tổng tiền</span>
                <span className="text-sm font-black text-primary">
                  {order ? order.totalPrice.toLocaleString() + "đ" : "0đ"}
                </span>
              </div>
              <Separator className="bg-muted/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phương thức</span>
                <span className="text-sm font-bold text-foreground">PAYOS (Chuyển khoản)</span>
              </div>
              <Separator className="bg-muted/70" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order?.status === 1 ? "bg-success/10 text-success text-success" : config.badgeColor}`}>
                  {order?.status === 1 ? "ĐÃ THANH TOÁN" : config.badgeText}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {order?.status === 1 ? (
                <>
                  <Link to="/account/orders" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full h-12 font-bold gap-2 border-border hover:bg-muted rounded-xl"
                    >
                      <FileText className="w-4 h-4" />
                      Lịch sử mua hàng
                    </Button>
                  </Link>
                  <Link to="/account/my-courses" className="flex-1">
                    <AppButton appVariant="gradient" className="w-full h-12 font-bold gap-2 rounded-xl">
                      Vào học ngay
                      <ArrowRight className="w-4 h-4" />
                    </AppButton>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/cart" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full h-12 font-bold gap-2 border-border hover:bg-muted rounded-xl"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Về giỏ hàng
                    </Button>
                  </Link>
                  <Link to="/checkout" className="flex-1">
                    <AppButton appVariant="gradient" className="w-full h-12 font-bold gap-2 rounded-xl">
                      <RotateCcw className="w-4 h-4" />
                      Thử lại
                    </AppButton>
                  </Link>
                </>
              )}
            </div>

            {/* Confirmation email note */}
            {order?.status === 1 && (
              <p className="text-xs text-muted-foreground mt-6">
                Email xác nhận đã được gửi đến email đăng ký tài khoản của bạn.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
