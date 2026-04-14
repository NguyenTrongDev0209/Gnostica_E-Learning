import React from "react";
import { Tag } from "lucide-react";

export default function AdminCoupons() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Mã Giảm Giá</h1>
        <p className="text-sm text-slate-500 mt-1">Tạo và quản lý các mã giảm giá cho khóa học.</p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 border-dashed gap-4">
        <Tag className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 font-medium">Trang Quản Lý Mã Giảm Giá đang được xây dựng</p>
      </div>
    </div>
  );
}
