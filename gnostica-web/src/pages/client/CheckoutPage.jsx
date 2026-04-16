import React, { useState } from "react";
import { Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { checkoutOrderItemsMock } from "@/mocks/cart";
import { paymentMethodsMock } from "@/mocks/checkout";
import {
  CheckoutOrderHeader,
  CheckoutOrderItemList,
  CheckoutPaymentMethod,
  CheckoutTrustBadges,
  CheckoutOrderSummary
} from "@/components/pages/client/checkout/CheckoutComponents";
import orderService from "@/services/orderService";

export default function CheckoutPage() {
  const { state } = useLocation();
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);

  // Dùng dữ liệu từ CourseDetail nếu có, fallback về mock
  const orderItems = state?.orderItems ?? checkoutOrderItemsMock;

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);
  const totalOriginal = orderItems.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const discount = totalOriginal - subtotal;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Thanh toán", isLast: true },
  ];

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (paymentMethod === "qr-code") {
      setLoading(true);
      try {
        // Kiểm tra đăng nhập
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          toast.error("Vui lòng đăng nhập để thực hiện thanh toán!");
          setLoading(false);
          return;
        }

        // Chuẩn bị dữ liệu tạo đơn hàng theo CreatePaymentLinkRequestBody
        const requestBody = {
          courseId: orderItems[0]?.id,
          productName: orderItems.length === 1 ? orderItems[0].title : `Đơn hàng ${orderItems.length} khóa học`,
          description: `Thanh toan khoa hoc`,
          price: subtotal,
          returnUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`
        };

        const response = await orderService.createOrder(requestBody);
        
        if (response.status === "success" || response.code === "success" || response.data) {
          const paymentData = response.data;
          toast.success("Tạo đơn hàng thành công!");
          navigate("/checkout/payos", { 
            state: { 
              paymentData,
              orderItems 
            } 
          });
        } else {
          toast.error(response.message || "Không thể tạo đơn hàng. Vui lòng thử lại!");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error(typeof error === 'string' ? error : "Có lỗi xảy ra khi xử lý đơn hàng!");
      } finally {
        setLoading(false);
      }
    } else {
      toast.info("Phương thức thanh toán này hiện đang được bảo trì. Vui lòng chọn phương thức thanh toán khác.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <main className="app-container">
        <CheckoutOrderHeader breadcrumbItems={breadcrumbItems} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="lg:col-span-8 space-y-6">
              <CheckoutOrderItemList orderItems={orderItems} />
              <CheckoutPaymentMethod
                paymentMethods={paymentMethodsMock}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
              <CheckoutTrustBadges />
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-10 space-y-6">
                <CheckoutOrderSummary
                  orderItems={orderItems}
                  loading={loading}
                  subtotal={subtotal}
                  totalOriginal={totalOriginal}
                  discount={discount}
                />
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

