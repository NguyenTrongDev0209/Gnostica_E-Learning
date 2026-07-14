import React from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingCart,
  Tag,
  MessageSquare,
  Settings,
  LogOut,
  BarChart3,
  Ticket,
  MessageCircleWarning,
  LayoutList,
  Building2,
  History,
  ShieldCheck
} from "lucide-react";

import { AppLogo } from "@/components/common/micro/AppButton";
import NotificationBell from "@/components/common/composite/NotificationBell";

const ADMIN_MENU_GROUPS = [
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


import useAuthStore from "@/store/useAuthStore";
import AdminSidebar from "@/components/fragments/AdminSidebar";
import AdminHeader from "@/components/fragments/AdminHeader";

export default function AdminLayout() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-slate-50 border-r border-border min-h-screen fixed left-0 top-0 bottom-0 flex flex-col z-50">
        {/* Brand */}
        <div className="h-16 flex items-center justify-center px-0 border-b border-border bg-white">
          <AppLogo className="h-12 md:h-12" />
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide text-slate-300">
          <nav className="flex flex-col gap-3">
            {ADMIN_MENU_GROUPS.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  {group.title}
                </p>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? location.pathname === "/admin"
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

        {/* User / Logout */}
        <div className="p-4 border-t border-border bg-white font-bold">
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
                <p className="text-[11px] text-muted-foreground truncate">{user?.email || "admin@system.com"}</p>
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

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="px-6 pt-4 pb-2 sticky top-0 z-40 bg-muted/80 backdrop-blur-sm">
          <div className="h-16 bg-white border border-border rounded-xl flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              {/* Search Bar */}
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
                  <img src={user.avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.substring(0, 2).toUpperCase() || "AD"
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
