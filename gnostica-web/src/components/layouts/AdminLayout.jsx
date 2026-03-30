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
  LayoutList
} from "lucide-react";
import { AppLogo } from "@/components/common/AppButton";

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
    title: "KINH DOANH",
    items: [
      { label: "Đơn hàng", icon: ShoppingCart, href: "/admin/orders" },
      { label: "Phiếu giảm", icon: Ticket, href: "/admin/coupons" },
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
      { label: "Cài đặt", icon: Settings, href: "/admin/settings" },
    ]
  }
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-slate-900 min-h-screen fixed left-0 top-0 bottom-0 text-slate-300 flex flex-col z-50">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <AppLogo />
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide text-slate-300">
          <nav className="flex flex-col gap-3">
            {ADMIN_MENU_GROUPS.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
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
                          flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all
                          ${isActive
                            ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                            : "hover:bg-slate-800 hover:text-white"
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-slate-400"}`} />
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 font-bold">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0 border border-slate-700">
                A
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">Administrator</p>
                <p className="text-[11px] text-slate-500 truncate">admin@system.com</p>
              </div>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-all ml-2 hover:shadow-lg"
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative w-full max-w-[340px] hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, học viên, mã giảm giá..."
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center relative transition-colors"
              onClick={() => navigate("/")}
              title="Về trang chủ phía Client"
            >
              <span className="text-xs font-bold text-primary mr-1">Client</span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center relative transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
