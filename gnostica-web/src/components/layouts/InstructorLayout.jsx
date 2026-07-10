import React from "react";
import { Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import InstructorSidebar from "@/components/fragments/InstructorSidebar";
import InstructorHeader from "@/components/fragments/InstructorHeader";

export default function InstructorLayout() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar - Static Flex */}
      <aside className="w-64 bg-slate-50 border-r border-border min-h-screen flex flex-col z-50">
        {/* Brand */}
        <div className="h-16 flex items-center justify-center px-0 border-b border-border bg-white">
          <AppLogo className="h-12 md:h-12" />
        </div>

        {/* Menu */}
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

        {/* User / Logout */}
        <div className="p-4 border-t border-border bg-white font-bold">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-success shrink-0 border border-border overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
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

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="px-6 pt-4 pb-2">
          <div className="h-16 bg-white border border-border rounded-xl flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4 flex-1">
              {/* Search Bar */}
              <div className="relative w-full max-w-[340px] hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm khóa học, câu hỏi của học viên..."
                  className="w-full h-10 pl-10 pr-4 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-success/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Button
                onClick={() => navigate("/instructor/courses/courses-form")}
                className="h-9 font-bold bg-success text-white hover:bg-success/90 flex items-center gap-1.5 shadow-none hidden lg:flex"
              >
                <Plus className="w-4 h-4" />
                Tạo khóa học mới
              </Button>

              <div className="w-px h-6 bg-muted mx-2 hidden lg:block"></div>

              <button
                className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center relative transition-colors"
                onClick={() => navigate("/")}
                title="Về trang chủ chứa danh mục"
              >
                <span className="text-xs font-bold text-muted-foreground mr-1">Client</span>
              </button>

              <NotificationBell />
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
