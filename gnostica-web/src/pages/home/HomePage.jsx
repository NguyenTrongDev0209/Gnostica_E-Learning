import React, { Suspense } from "react";
import MainHeroCarousel from "@/pages/home/components/MainHeroCarousel"
import SubBannerCarousel from "@/pages/home/components/SubBannerCarousel"
import CardCarousel from "@/pages/home/components/CardCarousel"
import PageContainer from "@/components/common/core/PageContainer";
import PlatformStats from "@/pages/home/components/PlatformStats"

import CategoryGrid from "@/pages/home/components/CategoryGrid"
import FeaturedCourses from "@/pages/home/components/FeaturedCourses"
import InstructorGrid from "@/pages/home/components/InstructorGrid"
import FAQSection from "@/pages/home/components/FAQSection"
import OutcomeBanner from "@/pages/home/components/OutcomeBanner"
import RecommendedCourses from "@/pages/home/components/RecommendedCourses"


function HomePage() {

  return (
    <PageContainer>
      <PageContainer.Content disableContainer={true} className="flex flex-col gap-12 sm:gap-16 pb-12 relative z-10 w-full overflow-hidden pt-0 md:pt-0">
        <MainHeroCarousel />
        
        <PlatformStats />

        <div className="app-container">
          <SubBannerCarousel />
        </div>

        <div className="app-container">
          <RecommendedCourses />
        </div>

        <PageContainer.Section title="Danh mục nổi bật" className="w-full app-container">
          <CategoryGrid />
        </PageContainer.Section>

        <PageContainer.Section title="Khóa học thịnh hành" className="w-full app-container">
          <FeaturedCourses />
        </PageContainer.Section>

        <PageContainer.Section title="Giảng viên tiêu biểu" className="w-full app-container">
          <InstructorGrid />
          <OutcomeBanner />
        </PageContainer.Section>

        <PageContainer.Section title="Khóa học nổi bật" className="w-full app-container">
          <CardCarousel />
        </PageContainer.Section>

        <PageContainer.Section title="Câu hỏi thường gặp" className="w-full app-container">
          <FAQSection />
        </PageContainer.Section>

      </PageContainer.Content>
    </PageContainer>
  )
}

export default HomePage
