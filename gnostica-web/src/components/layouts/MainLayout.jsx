import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

  const handleLogout = async () => {
    await logout();
  };

  // Lọc chỉ giữ lại những danh mục có khóa học
  const categoryTree = flatCategories
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories?.filter(sub => sub.courses > 0) || []
    }))
    .filter(cat => cat.courses > 0);

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

      <main className="flex-grow">
        <Outlet />
      </main>

      <MainFooter />

      <AiChatBot />
    </div>
  );
};

export default MainLayout;
