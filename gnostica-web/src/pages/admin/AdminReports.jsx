import React from "react";
import { BarChart3 } from "lucide-react";

export default function AdminReports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thống Kê &amp; Báo Cáo</h1>
        <p className="text-sm text-slate-500 mt-1">Phân tích doanh thu và hiệu suất của nền tảng.</p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-slate-200 border-dashed gap-4">
        <BarChart3 className="w-12 h-12 text-slate-300" />
        <p className="text-slate-400 font-medium">Trang Thống Kê đang được xây dựng</p>
      </div>
    </div>
  );
}
