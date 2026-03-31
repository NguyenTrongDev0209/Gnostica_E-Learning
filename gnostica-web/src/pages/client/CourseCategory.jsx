import React from "react";
import { useParams } from "react-router-dom";
import AppCard from "@/components/common/AppCard";
import AppSection, { PageHeader, AppBreadcrumb } from "@/components/common/AppSection";
import { Home } from "lucide-react";
import { popularCoursesMock } from "@/mocks/courses";

export default function CourseCategory() {
  const { categoryName } = useParams();

  const displayTitle = categoryName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || "Danh mục";

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", href: "/courses" },
    { label: displayTitle, isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container py-8 md:py-0 pb-0">
        <AppBreadcrumb items={breadcrumbItems} />

        <PageHeader
          title="Danh mục"
          highlightedTitle={displayTitle}
        />
      </div>

      {/* Phổ biến Section using AppSection component */}
      <AppSection
        title="Phổ biến"
        description={`Những khóa học được học viên yêu thích nhất trong danh mục ${displayTitle}`}
        className="py-0"
      >
        {popularCoursesMock.map((course) => (
          <AppCard key={course.id} {...course} />
        ))}
      </AppSection>
    </div>
  );
}
