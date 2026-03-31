import React from "react";
import { checkoutOrderItemsMock } from "@/mocks/cart";
import { paymentMethodsMock } from "@/mocks/checkout";
import CheckoutPageView from "@/components/client/CheckoutPageView";

export default function CheckoutPage() {
  return (
    <CheckoutPageView
      orderItems={checkoutOrderItemsMock}
      paymentMethods={paymentMethodsMock}
    />
  );
}
