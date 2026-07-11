import React, { Suspense } from "react";
import MainHeroCarousel from "@/pages/home/components/MainHeroCarousel"
import SubBannerCarousel from "@/pages/home/components/SubBannerCarousel"
import CardCarousel from "@/pages/home/components/CardCarousel"
import AppSection from "@/components/common/composite/AppSection"
import PlatformStats from "@/pages/home/components/PlatformStats"

import CategoryGrid from "@/pages/home/components/CategoryGrid"
import FeaturedCourses from "@/pages/home/components/FeaturedCourses"
import InstructorGrid from "@/pages/home/components/InstructorGrid"
import FAQSection from "@/pages/home/components/FAQSection"
import OutcomeBanner from "@/pages/home/components/OutcomeBanner"
import RecommendedCourses from "@/pages/home/components/RecommendedCourses"


function HomePage() {

  return (
    <div className={`min-h-[100dvh] transition-colors duration-700 ease-in-out bg-background`}>
      <div className="flex flex-col gap-12 sm:gap-16 pb-12 relative z-10 w-full overflow-hidden">
        <MainHeroCarousel />
        
        <PlatformStats />

        <div className="app-container">
          <SubBannerCarousel />
        </div>

        <div className="app-container">
          <RecommendedCourses />
        </div>

        <AppSection title="Danh mục nổi bật" containerClassName="w-full">
          <CategoryGrid />
        </AppSection>

        <AppSection title="Khóa học thịnh hành" containerClassName="w-full">
          <FeaturedCourses />
        </AppSection>

        <AppSection title="Giảng viên tiêu biểu" containerClassName="w-full">
          <InstructorGrid />
          <OutcomeBanner />
        </AppSection>

        <AppSection title="Khóa học nổi bật" containerClassName="w-full">
          <CardCarousel />
        </AppSection>

        <AppSection title="Câu hỏi thường gặp" containerClassName="w-full">
          <FAQSection />
        </AppSection>

      </div>
    </div>
  )
}

export default HomePage
