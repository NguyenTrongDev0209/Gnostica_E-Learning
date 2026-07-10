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
      <InstructorSidebar user={user} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <InstructorHeader />

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
