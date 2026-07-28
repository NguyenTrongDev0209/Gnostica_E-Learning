import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  ShoppingBag,
  Heart,
  Ticket,
  UserCog,
  KeyRound,
  Bell,
  LogOut,
  Users,
  MessageSquare,
} from "lucide-react";

const MENU_GROUPS = [
  {
    title: "Học tập",
    items: [
      { label: "Tổng quan", icon: LayoutDashboard, href: "/account" },
      { label: "Khóa học của tôi", icon: BookOpen, href: "/account/my-courses" },
      { label: "Tin nhắn", icon: MessageSquare, href: "/account/messages" },
      { label: "Giảng viên yêu thích", icon: Users, href: "/account/following" },
      { label: "Chứng chỉ", icon: Award, href: "/account/certificates" },
    ],
  },
  {
    title: "Thanh toán",
    items: [
      { label: "Danh sách yêu thích", icon: Heart, href: "/account/wishlist" },
      { label: "Lịch sử đơn hàng", icon: ShoppingBag, href: "/account/orders" },
      { label: "Kho giảm giá", icon: Ticket, href: "/account/vouchers", badge: "2" },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { label: "Thông báo", icon: Bell, href: "/account/notifications" },
      { label: "Hồ sơ cá nhân", icon: UserCog, href: "/account/settings" },
      { label: "Bảo mật", icon: KeyRound, href: "/account/change-password" },
    ],
  },
];

export default function AccountSidebar({ user, currentUser, handleLogout }) {
  const location = useLocation();

  return (
    <aside className="w-full lg:w-1/4 lg:max-w-[320px] shrink-0">
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden sticky top-24">
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
            <p className="font-bold text-foreground">{user.name}</p>
          </div>
        </div>

        <Separator />

        {/* Menu Groups */}
        <nav className="p-2 space-y-6">
          {MENU_GROUPS.map((group) => {
            const filteredItems = group.items.filter(item => {
              if (item.href === "/account/change-password" && currentUser?.provider === "GOOGLE") {
                return false;
              }
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.title}>
                <h3 className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
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
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
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
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-bold text-error hover:bg-error-soft transition-all"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
