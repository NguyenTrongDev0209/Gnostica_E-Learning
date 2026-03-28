import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Heart,
  Ticket,
  UserCog,
  KeyRound,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MENU_ITEMS = [
  { label: "Tổng quan", icon: LayoutDashboard, href: "/account", color: "text-primary" },
  { label: "Đơn hàng", icon: ShoppingBag, href: "/account/orders" },
  { label: "Địa chỉ", icon: MapPin, href: "/account/addresses" },
  { label: "Yêu thích", icon: Heart, href: "/account/wishlist" },
  { label: "Kho Voucher", icon: Ticket, href: "/account/vouchers", badge: "2" },
  { label: "Thông tin tài khoản", icon: UserCog, href: "/account/settings" },
  { label: "Đổi mật khẩu", icon: KeyRound, href: "/account/change-password" },
];

const MOCK_USER = {
  name: "Minh Lê",
  avatar: "https://i.pravatar.cc/100?u=minhle",
};

const AccountLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-[1536px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
              {/* User Info */}
              <div className="p-5 flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-primary/10">
                  <AvatarImage src={MOCK_USER.avatar} alt={MOCK_USER.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {MOCK_USER.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Tài khoản của</p>
                  <p className="font-bold text-slate-900">{MOCK_USER.name}</p>
                </div>
              </div>

              <Separator />

              {/* Menu */}
              <nav className="p-2">
                {MENU_ITEMS.map((item) => {
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
                        flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${isActive
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <Icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : "text-slate-400"}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0 hover:bg-primary/10">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <Separator />

              {/* Logout */}
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="w-[18px] h-[18px]" />
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
