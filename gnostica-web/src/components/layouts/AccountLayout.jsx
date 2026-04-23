import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  BookOpen,
  Activity,
  Award,
  ShoppingBag,
  Heart,
  Ticket,
  UserCog,
  KeyRound,
  Bell,
  LogOut,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import authService from "@/services/authService";

const MENU_GROUPS = [
  {
    title: "Học tập",
    items: [
      { label: "Tổng quan", icon: LayoutDashboard, href: "/account" },
      { label: "Khóa học của tôi", icon: BookOpen, href: "/account/my-courses" },
      { label: "Tiến độ học tập", icon: Activity, href: "/account/progress" },
      { label: "Giảng viên yêu thích", icon: Users, href: "/account/following" },
      { label: "Chứng chỉ", icon: Award, href: "/account/certificates" },
    ],
  },
  {
    title: "Giao dịch",
    items: [
      { label: "Danh sách yêu thích", icon: Heart, href: "/account/wishlist" },
      { label: "Lịch sử đơn hàng", icon: ShoppingBag, href: "/account/orders" },
      { label: "Kho Voucher", icon: Ticket, href: "/account/vouchers", badge: "2" },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { label: "Thông báo", icon: Bell, href: "/account/notifications" },
      { label: "Hồ sơ cá nhân", icon: UserCog, href: "/account/settings" },
      { label: "Bảo mật & Mật khẩu", icon: KeyRound, href: "/account/change-password" },
    ],
  },
];

const AccountLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const user = currentUser ? {
    name: currentUser.fullName || currentUser.username || "Học viên",
    avatar: currentUser.avatar || "https://github.com/shadcn.png"
  } : {
    name: "Khách",
    avatar: "https://github.com/shadcn.png"
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="app-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4 lg:max-w-[320px] shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-5 flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Tài khoản của</p>
                  <p className="font-bold text-slate-900">{user.name}</p>
                </div>
              </div>

              <Separator />

              {/* Menu Groups */}
              <nav className="p-2 space-y-6">
                {MENU_GROUPS.map((group) => {
                  // Lọc bớt các mục menu không phù hợp với loại tài khoản
                  const filteredItems = group.items.filter(item => {
                    if (item.href === "/account/change-password" && currentUser?.provider === "GOOGLE") {
                      return false;
                    }
                    return true;
                  });

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={group.title}>
                      <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {group.title}
                      </h3>
                      <div className="space-y-1">
                        {filteredItems.map((item) => {
                          const Icon = item.icon;
                          const isActive =
                            item.href === "/account"
                              ? location.pathname === "/account"
                              : location.pathname.startsWith(item.href);

                          return (
                            <Link
                              key={item.href}
                              to={item.href}
                              className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-all
                                ${isActive
                                  ? "bg-primary/5 text-primary font-bold shadow-sm ring-1 ring-primary/10"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }
                              `}
                            >
                              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-400"}`} />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0 hover:bg-primary/10">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>

              <Separator />

              {/* Logout */}
              <div className="p-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold text-red-500 hover:bg-red-50 transition-all font-bold"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
