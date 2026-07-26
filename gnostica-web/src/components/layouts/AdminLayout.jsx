import React from "react";
import { Outlet } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";
import AdminSidebar from "@/components/fragments/AdminSidebar";
import AdminHeader from "@/components/fragments/AdminHeader";
import PageContainer from "@/components/common/core/PageContainer";

export default function AdminLayout() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <PageContainer className="bg-muted flex-row h-screen overflow-hidden">
      {/* Sidebar - Reusable Component */}
      <AdminSidebar user={user} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <AdminHeader user={user} />

        {/* Page Content */}
        <PageContainer.Content disableContainer className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide gap-0">
          <Outlet />
        </PageContainer.Content>
      </div>
    </PageContainer>
  );
}
