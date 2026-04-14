import React from "react";
import { PageHeader, AppBreadcrumb } from "@/components/common/AppSection";
import CourseListSection from "@/components/client/CourseListSection";
import { Home } from "lucide-react";
import useCategories from "@/hooks/useCategories";
import useCourses from "@/hooks/useCourses";

export default function CourseCatalog() {
  const { categories } = useCategories();
  const { 
    courses, 
    loading, 
    filters, 
    pagination, 
    handleFilterChange, 
    handlePageChange 
  } = useCourses({ initialPageSize: 9 });

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", isLast: true }
  ];

  return (
    <div className="app-container py-8 md:py-12 bg-background">
      <AppBreadcrumb items={breadcrumbItems} />
      
      <PageHeader 
        title="Khám phá các" 
        highlightedTitle="Khóa học" 
        description="Khám phá các khóa học đa dạng được thiết kế để giúp bạn làm chủ các kỹ năng mới và thăng tiến trong sự nghiệp."
      />

      <CourseListSection
        courses={courses}
        loading={loading}
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage="Hiện chưa có khóa học nào phù hợp với tiêu chí của bạn."
      />
    </div>
  );
}
