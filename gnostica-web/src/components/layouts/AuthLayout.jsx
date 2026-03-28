import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppLogo } from '@/components/common/AppButton';

const AuthLayout = () => {
  return (
    <div 
      className="flex flex-col min-h-screen relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg_auth.webp')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/50 z-0"></div>

      {/* Logo Container */}
      <div className="absolute top-0 left-0 p-4 sm:p-6 lg:p-8 z-50">
        <AppLogo />
      </div>

      <main className="flex-grow flex items-center justify-center p-4 py-20 sm:p-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
