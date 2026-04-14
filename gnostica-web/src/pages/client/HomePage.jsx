import React, { Suspense } from "react";
import { MainHeroCarousel, SubBannerCarousel, CardCarousel } from "@/components/pages/client/home/HomeCarousels"
import AppSection from "@/components/common/AppSection"

import CategoryGrid from "@/components/pages/client/home/CategoryGrid"
import FeaturedCourses from "@/components/pages/client/home/FeaturedCourses"
import InstructorGrid from "@/components/pages/client/home/InstructorGrid"

const PlatformStats = React.lazy(() => import("@/components/pages/client/home/PlatformStats"));

function HomePage() {

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 ease-in-out bg-background`}>
      <div className="flex flex-col gap-12 sm:gap-16 pb-12 relative z-10 w-full overflow-hidden">
        <MainHeroCarousel />

        <div className="app-container">
          <SubBannerCarousel />
        </div>

        <AppSection title="Danh mục nổi bật" containerClassName="w-full">
          <CategoryGrid />
        </AppSection>

        <AppSection title="Khóa học thịnh hành" containerClassName="w-full">
          <FeaturedCourses />
        </AppSection>

        <AppSection title="Giảng viên tiêu biểu" containerClassName="w-full">
          <InstructorGrid />
        </AppSection>

        <AppSection title="Khóa học nổi bật" containerClassName="w-full">
          <CardCarousel />
        </AppSection>

        <Suspense fallback={<div className="app-container mb-8 h-32 flex items-center justify-center text-muted-foreground">Đang tải thống kê...</div>}>
          <PlatformStats />
        </Suspense>

      </div>
    </div>
  )
}

export default HomePage
