import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Ticket,
  MessageSquare,
  Settings,
  LogOut,
  MessageCircleWarning,
  LayoutList,
  Building2,
  History,
  ShieldCheck
} from "lucide-react";
import { AppLogo } from "@/components/common/micro/AppButton";

export const ADMIN_MENU_GROUPS = [
  {
    title: "QUẢN LÝ CHUNG",
    items: [
      { label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
      { label: "Người dùng", icon: Users, href: "/admin/users" },
    ]
  },
  {
    title: "NỘI DUNG",
    items: [
      { label: "Khóa học", icon: BookOpen, href: "/admin/courses" },
      { label: "Danh mục", icon: LayoutList, href: "/admin/categories" },
    ]
  },
  {
    title: "KIỂM DUYỆT",
    items: [
      { label: "Kiểm duyệt khóa học", icon: ShieldCheck, href: "/admin/course-moderation" },
      { label: "Kiểm duyệt bài viết", icon: MessageSquare, href: "/admin/thread-moderation" },
    ]
  },
  {
    title: "KINH DOANH",
    items: [
      { label: "Đơn hàng", icon: ShoppingCart, href: "/admin/orders" },
      { label: "Phiếu giảm", icon: Ticket, href: "/admin/coupons" },
      { label: "Giao dịch", icon: History, href: "/admin/transactions" },
    ]
  },
  {
    title: "TƯƠNG TÁC",
    items: [
      { label: "Đánh giá", icon: MessageSquare, href: "/admin/reviews" },
      { label: "Báo cáo", icon: MessageCircleWarning, href: "/admin/reports" },
    ]
  },
  {
    title: "HỆ THỐNG",
    items: [
      { label: "Ngân hàng", icon: Building2, href: "/admin/banks" },
      { label: "Cài đặt", icon: Settings, href: "/admin/settings" },
    ]
  }
];

export default function AdminSidebar({ user, handleLogout }) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen fixed left-0 top-0 bottom-0 flex flex-col z-50">
      <div className="h-16 flex items-center justify-center px-0 border-b border-border bg-card">
        <AppLogo className="h-12 md:h-12" />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <nav className="flex flex-col gap-3">
          {ADMIN_MENU_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <p className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {group.title}
              </p>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? location.pathname === "/admin" || location.pathname === "/admin/"
                      : location.pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all group
                        ${isActive
                          ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
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

      <div className="p-4 border-t border-border bg-card font-bold">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground shrink-0 border border-border overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || "A"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.fullName || "Administrator"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@system.com"}</p>
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
