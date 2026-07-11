import React from "react";
import { useParams } from "react-router-dom";
import { CourseCardHorizontal } from "@/components/common/composite/AppCard";
import AppSection, { PageHeader, AppBreadcrumb } from "@/components/common/composite/AppSection";
import { Home } from "lucide-react";
import { popularCoursesMock } from "@/apiMocks/courses";

export default function CourseCategory() {
  const { categoryName } = useParams();

  const displayTitle = categoryName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || "Danh mục";

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khóa học", href: "/courses" },
    { label: displayTitle, isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container py-8 md:py-0 pb-0">
        <AppBreadcrumb items={breadcrumbItems} />

        <PageHeader
          title={displayTitle}
          description={`Khám phá các khóa học đa dạng được thiết kế để giúp bạn nắm vững ${displayTitle} và thăng tiến trong sự nghiệp.`}
        />
      </div>

      {/* Danh sách khóa học Section */}
      <AppSection
        title={`Tất cả khóa học ${displayTitle}`}
        className="py-0"
        containerClassName="flex flex-col gap-4"
      >
        {popularCoursesMock.map((course) => (
          <CourseCardHorizontal key={course.id} {...course} />
        ))}
      </AppSection>
    </div>
  );
}
