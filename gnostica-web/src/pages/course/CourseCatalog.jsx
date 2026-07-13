import React, { useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import CourseListSection from "@/pages/course/components/shared/CourseListSection";
import CourseCard from "@/components/common/composite/CourseCard";
import { Home } from "lucide-react";
import useCategories from "@/hooks/course/useCategories";
import useCourses from "@/hooks/course/useCourses";
import { popularCoursesMock } from "@/apiMocks/courses";

// Mock "thịnh hành" = reversed order for differentiation
const trendingCoursesMock = [...popularCoursesMock].reverse();

const TABS = ["Phổ biến nhất", "Thịnh hành"];

export default function CourseCatalog() {
  const { categorySlug } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const { categories } = useCategories();
  const {
    courses,
    loading,
    filters,
    pagination,
    handleFilterChange,
    handlePageChange
  } = useCourses({ initialPageSize: 9 });

  // Derive display title from slug
  const displayTitle = categorySlug
    ? categorySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    : null;

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khóa học", href: "/courses" },
    ...(displayTitle
      ? [{ label: displayTitle, isLast: true }]
      : [{ label: "Tất cả khóa học", isLast: true }])
  ];

  const tabCourses = activeTab === 0 ? popularCoursesMock : trendingCoursesMock;

  return (
    <div className="app-container py-8 md:py-12 bg-background">
      <PageContainer.Header
        title={displayTitle || <>Khám phá các <span className="bg-accent-gradient bg-clip-text text-transparent italic">Khóa học</span></>}
        description={displayTitle 
          ? `Khám phá các khóa học ${displayTitle} đa dạng được thiết kế để giúp bạn nắm vững kiến thức và thăng tiến trong sự nghiệp.` 
          : "Khám phá các khóa học đa dạng được thiết kế để giúp bạn làm chủ các kỹ năng mới và thăng tiến trong sự nghiệp."}
      >
        <AppBreadcrumb paths={breadcrumbItems} />
      </PageContainer.Header>

      {/* Tabbed Popular / Trending Section */}
      <div className="mb-12">
        {/* Tab Buttons */}
        <div className="flex gap-0 border-b border-border mb-6">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-3 text-sm font-semibold transition-all relative
                ${activeTab === idx
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tabCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>

      {/* All Courses with Sidebar Filter */}
      <CourseListSection
        courses={courses}
        loading={loading}
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage="Hiện chưa có khóa học nào phù hợp với tiêu chí của bạn."
        sectionTitle={displayTitle ? `Tất cả khóa học ${displayTitle}` : "Tất cả khóa học"}
      />
    </div>
  );
}
