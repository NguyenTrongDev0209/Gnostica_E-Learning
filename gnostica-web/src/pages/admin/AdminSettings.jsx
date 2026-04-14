import React from "react";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài Đặt Hệ Thống</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình và tùy chỉnh các thông số của nền tảng.</p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 border-dashed gap-4">
        <Settings className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 font-medium">Trang Cài Đặt đang được xây dựng</p>
      </div>
    </div>
  );
}
