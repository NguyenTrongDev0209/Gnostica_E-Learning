import React from "react";
import { PageHeader, AppBreadcrumb } from "@/components/common/AppSection";
import CourseListSection from "@/components/pages/client/shared/CourseListSection";
import { Home } from "lucide-react";
import { courseCatalogMock } from "@/mocks/courses";

export default function CourseCatalog() {
  const [priceRange, setPriceRange] = React.useState([0, 2000000]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Khoá học", isLast: true }
  ];

  return (
    <div className="app-container py-8 md:py-12 bg-background">
      <AppBreadcrumb items={breadcrumbItems} />
      
      <PageHeader 
        title="Explore Our" 
        highlightedTitle="Courses" 
        description="Discover a wide range of courses tailored to help you master new skills and advance your career in the tech industry."
      />

      <CourseListSection
        courses={courseCatalogMock}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        emptyMessage="Hiện chưa có khóa học phù hợp."
      />
    </div>
  );
}
