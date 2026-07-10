import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from '@/store/useAuthStore';
import AccountSidebar from "@/components/fragments/AccountSidebar";

const AccountLayout = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const user = currentUser ? {
    name: currentUser.fullName || currentUser.username || "Học viên",
    avatar: currentUser.avatar || "https://github.com/shadcn.png"
  } : {
    name: "Khách",
    avatar: "https://github.com/shadcn.png"
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="app-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <AccountSidebar user={user} currentUser={currentUser} handleLogout={handleLogout} />

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;
