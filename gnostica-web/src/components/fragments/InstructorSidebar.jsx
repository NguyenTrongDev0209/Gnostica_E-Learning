import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  Ticket,
  Settings,
  LogOut
} from "lucide-react";
import { AppLogo } from "@/components/common/AppButton";

const INSTRUCTOR_MENU_GROUPS = [
  {
    title: "QUẢN LÝ CHUNG",
    items: [
      { label: "Tổng quan", icon: LayoutDashboard, href: "/instructor" },
      { label: "Học viên", icon: Users, href: "/instructor/students" },
    ]
  },
  {
    title: "NỘI DUNG",
    items: [
      { label: "Khóa học", icon: BookOpen, href: "/instructor/courses" },
    ]
  },
  {
    title: "KINH DOANH",
    items: [
      { label: "Doanh thu", icon: Wallet, href: "/instructor/revenue" },
      { label: "Phiếu giảm", icon: Ticket, href: "/instructor/coupons" },
    ]
  },
  {
    title: "HỆ THỐNG",
    items: [
      { label: "Cài đặt", icon: Settings, href: "/instructor/settings" },
    ]
  }
];

export default function InstructorSidebar({ user, handleLogout }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-50 border-r border-border min-h-screen fixed left-0 top-0 bottom-0 flex flex-col z-50">
      <div className="h-16 flex items-center justify-center px-0 border-b border-border bg-white">
        <AppLogo className="h-12 md:h-12" />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <nav className="flex flex-col gap-3">
          {INSTRUCTOR_MENU_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                {group.title}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/instructor"
                      ? location.pathname === "/instructor"
                      : location.pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all group
                        ${isActive
                          ? "bg-success text-white font-bold shadow-md shadow-success/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border bg-white font-bold">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-success shrink-0 border border-border overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || "I"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.fullName || "Giảng viên"}</p>
              <p className="text-[11px] text-muted-foreground truncate uppercase tracking-wider">{user?.role || "Instructor"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-error transition-all ml-2 hover:shadow-lg"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}
