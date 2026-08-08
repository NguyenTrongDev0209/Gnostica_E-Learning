import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  CreditCard,
  FileText,
  Globe,
  Image as ImageIcon,
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
  Percent,
  ShieldCheck,
  Headphones,
  Shield,
  GraduationCap,
  Banknote,
  RotateCcw
} from "lucide-react";
import { AppLogo } from "@/components/common/micro/AppButton";

const ADMIN_USERS_SUB_ITEMS = [
  { label: "Người dùng", icon: Users, href: "/admin/users?tab=USER", tab: "USER" },
  { label: "Giảng viên", icon: GraduationCap, href: "/admin/users?tab=INSTRUCTOR", tab: "INSTRUCTOR" },
  { label: "Chờ duyệt", icon: ShieldCheck, href: "/admin/users?tab=PENDING_APP", tab: "PENDING_APP" },
];

const ADMIN_SETTINGS_SUB_ITEMS = [
  { label: "Cài đặt chung", icon: Globe, href: "/admin/settings?tab=general", tab: "general" },
  {
    label: "Cài đặt trang",
    icon: ImageIcon,
    href: "/admin/settings?tab=site-pages&page=home",
    tab: "site-pages",
    legacyTabs: ["home", "about"],
  },
  { label: "Nội dung", icon: FileText, href: "/admin/settings?tab=pages", tab: "pages" },
  { label: "Thanh toán", icon: CreditCard, href: "/admin/settings?tab=payment", tab: "payment" },
  { label: "Tài chính", icon: Percent, href: "/admin/settings?tab=finance", tab: "finance" },
  { label: "Bảo mật", icon: Shield, href: "/admin/settings?tab=security", tab: "security" },
];

const ADMIN_COUPONS_SUB_ITEMS = [
  { label: "Nền tảng", icon: Globe, href: "/admin/coupons?tab=platform", tab: "platform" },
  { label: "Giảng viên", icon: GraduationCap, href: "/admin/coupons?tab=instructors", tab: "instructors" },
];

const ADMIN_TRANSACTIONS_SUB_ITEMS = [
  {
    label: "Thanh toán",
    icon: CreditCard,
    href: "/admin/transactions?tab=payments",
    tab: "payments",
    legacyTabs: ["general"],
  },
  { label: "Rút tiền", icon: Banknote, href: "/admin/transactions?tab=withdrawals", tab: "withdrawals" },
  { label: "Hoàn tiền", icon: RotateCcw, href: "/admin/transactions?tab=refunds", tab: "refunds" },
];

const ADMIN_MENU_GROUPS = [
  {
    title: "QUẢN LÝ CHUNG",
    items: [
      { label: "Tổng quan", icon: LayoutDashboard, href: "/admin" },
      { label: "Người dùng", icon: Users, href: "/admin/users", children: ADMIN_USERS_SUB_ITEMS },
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
      { label: "Phiếu giảm", icon: Ticket, href: "/admin/coupons", children: ADMIN_COUPONS_SUB_ITEMS },
      { label: "Giao dịch", icon: History, href: "/admin/transactions", children: ADMIN_TRANSACTIONS_SUB_ITEMS },
    ]
  },
  {
    title: "TƯƠNG TÁC",
    items: [
      { label: "Đánh giá", icon: MessageSquare, href: "/admin/reviews" },
      { label: "Báo cáo", icon: MessageCircleWarning, href: "/admin/reports" },
      { label: "Yêu cầu", icon: Headphones, href: "/admin/requests" },
    ]
  },
  {
    title: "HỆ THỐNG",
    items: [
      { label: "Ngân hàng", icon: Building2, href: "/admin/banks" },
      { label: "Cài đặt", icon: Settings, href: "/admin/settings", children: ADMIN_SETTINGS_SUB_ITEMS },
    ]
  }
];

export default function AdminSidebar({ user, handleLogout }) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({});

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
                  const hasChildren = Boolean(item.children?.length);
                  const isActive =
                    item.href === "/admin"
                      ? location.pathname === "/admin" || location.pathname === "/admin/"
                      : location.pathname.startsWith(item.href);
                  const isOpen = openGroups[item.href] ?? isActive;

                  if (hasChildren) {
                    return (
                      <div key={item.href} className="space-y-1">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenGroups((current) => ({
                              ...current,
                              [item.href]: !isOpen,
                            }))
                          }
                          className={`
                            flex w-full items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all group
                            ${isActive
                              ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`} />
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isOpen && (
                          <div className="relative ml-5 pl-3">
                            <span className="absolute left-0 top-1 bottom-1 w-px bg-border" aria-hidden="true" />
                            <div className="flex flex-col gap-1 py-1">
                              {item.children.map((child) => {
                                const ChildIcon = child.icon;
                                const params = new URLSearchParams(location.search);
                                const activeTab = params.get("tab") || "general";
                                const isChildActive =
                                  location.pathname === item.href &&
                                  (activeTab === child.tab || child.legacyTabs?.includes(activeTab));

                                return (
                                  <div key={child.href} className="relative">
                                    <span
                                      className={`
                                        absolute -left-3 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card transition-all
                                        ${isChildActive ? "h-3 w-3 bg-primary" : "h-2 w-2 bg-border"}
                                      `}
                                      aria-hidden="true"
                                    />
                                    <Link
                                      to={child.href}
                                      className={`
                                        flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold transition-all
                                        ${isChildActive
                                          ? "bg-primary/10 text-primary"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }
                                      `}
                                    >
                                      <ChildIcon className="h-4 w-4 shrink-0" />
                                      {child.label}
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

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
