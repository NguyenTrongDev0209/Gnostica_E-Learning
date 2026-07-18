import React from "react";
import {MessageSquare, Star} from "lucide-react";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";

export default function AdminReviews() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Star className="w-6 h-6 text-primary" />
          Đánh Giá & Bình Luận
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý và kiểm duyệt các phản hồi, đánh giá từ học viên.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-border border-dashed gap-4">
        <MessageSquare className="w-12 h-12 text-slate-300" />
        <p className="text-muted-foreground font-medium">Trang Đánh Giá &amp; Bình Luận đang được xây dựng</p>
      </div>
    </div>
  );
}
