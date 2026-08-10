import React from "react";
import { BarChart3 } from "lucide-react";

export default function AdminReports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Thống Kê & Báo Cáo
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem báo cáo chi tiết về doanh thu, học viên và hiệu suất nền tảng.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl border border-border border-dashed gap-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground/30" />
        <h3 className="text-lg font-bold text-foreground">Trang Thống Kê Chung</h3>
        <p className="text-muted-foreground font-medium text-sm">Tính năng này đang được phát triển</p>
      </div>
    </div>
  );
}
