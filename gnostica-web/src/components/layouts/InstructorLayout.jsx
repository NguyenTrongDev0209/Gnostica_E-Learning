import React from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Bell, 
  Search, 
  Menu, 
  Plus,
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare,
  BarChart,
  Settings,
  LogOut,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLogo } from "@/components/common/AppButton";

const INSTRUCTOR_MENU = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/instructor" },
  { label: "Khóa học của tôi", icon: BookOpen, href: "/instructor/courses" },
  { label: "Học viên", icon: Users, href: "/instructor/students" },
  { label: "Doanh thu", icon: Wallet, href: "/instructor/revenue" },
  { label: "Hỏi đáp & Đánh giá", icon: MessageSquare, href: "/instructor/qa" },
  { label: "Báo cáo nội dung", icon: BarChart, href: "/instructor/reports" },
  { label: "Cài đặt khóa học", icon: Settings, href: "/instructor/settings" },
];

export default function InstructorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-slate-900 min-h-screen fixed left-0 top-0 bottom-0 text-slate-300 flex flex-col z-50">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
          <AppLogo />
          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-green-400 border border-green-500/20 bg-green-500/10 px-1.5 py-0.5 rounded-md">
            Instructor
          </span>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <p className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Công cụ giảng viên
          </p>
          <nav className="flex flex-col gap-1">
            {INSTRUCTOR_MENU.map((item) => {
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? "bg-green-600 text-white font-bold shadow-md shadow-green-900/20" 
                      : "hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 overflow-hidden border border-slate-700">
              <img src="https://i.pravatar.cc/100?u=instructor" alt="Instructor Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Sonny Sangha</p>
              <p className="text-xs text-slate-500">Giảng viên xuất sắc</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative w-96 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm khóa học, câu hỏi của học viên..." 
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Button className="h-9 font-bold bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-none hidden lg:flex">
              <Plus className="w-4 h-4" />
              Tạo khóa học mới
            </Button>
            
            <div className="w-px h-6 bg-slate-200 mx-2 hidden lg:block"></div>

            <button 
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center relative transition-colors"
              onClick={() => navigate("/")}
              title="Về trang chủ chứa danh mục"
            >
              <span className="text-xs font-bold text-slate-500 mr-1">Client</span>
            </button>
            
            <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center relative transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
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
