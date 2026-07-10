import React from "react";
import { Outlet } from "react-router-dom";
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
      <AdminSidebar user={user} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader user={user} />

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
