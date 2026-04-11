import React, { useState } from "react";
import { Home } from "lucide-react";
import { checkoutOrderItemsMock } from "@/mocks/cart";
import { paymentMethodsMock } from "@/mocks/checkout";
import { 
  CheckoutOrderHeader, 
  CheckoutOrderItemList, 
  CheckoutPaymentMethod, 
  CheckoutTrustBadges, 
  CheckoutOrderSummary 
} from "@/components/pages/client/checkout/CheckoutComponents";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [loading, setLoading] = useState(false);

  const subtotal = checkoutOrderItemsMock.reduce((sum, item) => sum + item.price, 0);
  const totalOriginal = checkoutOrderItemsMock.reduce((sum, item) => sum + item.originalPrice, 0);
  const discount = totalOriginal - subtotal;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Giỏ hàng", href: "/cart" },
    { label: "Thanh toán", isLast: true },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <main className="app-container">
        <CheckoutOrderHeader breadcrumbItems={breadcrumbItems} />

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="lg:col-span-8 space-y-6">
              <CheckoutOrderItemList orderItems={checkoutOrderItemsMock} />
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
                  orderItems={checkoutOrderItemsMock}
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

