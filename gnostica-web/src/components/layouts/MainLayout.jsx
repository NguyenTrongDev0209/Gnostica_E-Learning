import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';
import useCategories from "@/hooks/course/useCategories"
import AiChatBot from '@/components/common/composite/AiChatBot'
import MainHeader from '@/components/fragments/MainHeader'
import MainFooter from '@/components/fragments/MainFooter'

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCoursesMobileOpen, setIsCoursesMobileOpen] = useState(false)
  const currentUser = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { categories: flatCategories } = useCategories()
  const location = useLocation();

  const isMessagingRoute = location.pathname.startsWith('/account/messages');

  const handleLogout = async () => {
    await logout();
  };

  // Xây dựng cây danh mục cha - con cho menu Header
  const parentCategories = flatCategories.filter(cat => !cat.parentId && !cat.parent_id && !cat.parent);

  const categoryTree = (parentCategories.length > 0 ? parentCategories : flatCategories).map(parent => {
    const children = parent.subcategories && parent.subcategories.length > 0
      ? parent.subcategories
      : flatCategories.filter(c => c.parentId === parent.id || c.parent_id === parent.id || c.parent?.id === parent.id);

    return {
      ...parent,
      subcategories: children
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader
        currentUser={currentUser}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isCoursesMobileOpen={isCoursesMobileOpen}
        setIsCoursesMobileOpen={setIsCoursesMobileOpen}
        flatCategories={categoryTree}
        categoryTree={categoryTree}
      />

      <main className={`flex-grow ${isMessagingRoute ? 'flex flex-col h-[calc(100vh-64px)] overflow-hidden' : ''}`}>
        <Outlet />
      </main>

      {!isMessagingRoute && <MainFooter />}

      {!isMessagingRoute && <AiChatBot />}
    </div>
  );
};

export default MainLayout;
