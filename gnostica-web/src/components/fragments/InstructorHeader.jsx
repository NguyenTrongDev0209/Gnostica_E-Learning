import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/common/micro/NotificationBell";

export default function InstructorHeader() {
  const navigate = useNavigate();

  return (
    <header className="px-6 pt-4 pb-2">
      <div className="h-16 bg-white border border-border rounded-xl flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-[340px] hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm khóa học, câu hỏi của học viên..."
              className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-success/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Button
            onClick={() => navigate("/instructor/courses/courses-form")}
            className="h-9 font-bold bg-success text-white hover:bg-success/90 flex items-center gap-1.5 shadow-none hidden lg:flex"
          >
            <Plus className="w-4 h-4" />
            Tạo khóa học mới
          </Button>

          <div className="w-px h-6 bg-muted mx-2 hidden lg:block"></div>

          <button
            className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center relative transition-colors"
            onClick={() => navigate("/")}
            title="Về trang chủ chứa danh mục"
          >
            <span className="text-xs font-bold text-muted-foreground mr-1">Client</span>
          </button>

          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
