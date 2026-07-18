import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppLogo } from '@/components/common/micro/AppButton';
import PageContainer from '@/components/common/core/PageContainer';

const AuthLayout = () => {
  return (
    <PageContainer
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg_auth.webp')" }}
    >
      <div className="absolute inset-0 bg-muted/50 z-0"></div>

      <div className="absolute top-0 left-0 p-4 sm:p-6 lg:p-8 z-50">
        <AppLogo src="/Gnostica_Mark.webp" />
      </div>

      <PageContainer.Content disableContainer className="items-center justify-center p-4 py-20 sm:p-8 relative z-10 [&>div]:container-sm [&>div]:px-0">
        <Outlet />
      </PageContainer.Content>
    </PageContainer>
  );
};

export default AuthLayout;
