import React from "react";
import { ShoppingCart } from "lucide-react";

export default function AdminOrders() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Đơn Hàng</h1>
        <p className="text-sm text-slate-500 mt-1">Xem và xử lý tất cả đơn hàng trên hệ thống.</p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 border-dashed gap-4">
        <ShoppingCart className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 font-medium">Trang Quản Lý Đơn Hàng đang được xây dựng</p>
      </div>
    </div>
  );
}
