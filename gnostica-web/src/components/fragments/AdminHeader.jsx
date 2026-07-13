import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import NotificationBell from "@/components/common/composite/NotificationBell";

export default function AdminHeader({ user }) {
  const navigate = useNavigate();

  return (
    <header className="px-6 pt-4 pb-2 sticky top-0 z-40 bg-muted/80 backdrop-blur-sm">
      <div className="h-16 bg-white border border-border rounded-xl flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-[340px] hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, học viên, mã giảm giá..."
              className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center relative transition-colors"
            onClick={() => navigate("/")}
            title="Về trang chủ phía Client"
          >
            <span className="text-xs font-bold text-primary mr-1">Client</span>
          </button>
          <div className="w-px h-6 bg-muted mx-1"></div>
          <NotificationBell />
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.substring(0, 2).toUpperCase() || "AD"
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
