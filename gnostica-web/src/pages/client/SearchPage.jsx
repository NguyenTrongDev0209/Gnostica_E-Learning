import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppBreadcrumb, PageHeader } from "@/components/common/AppSection";
import CourseListSection from "@/components/client/CourseListSection";
import { Home } from "lucide-react";
import { searchCourses } from "@/mocks/courses";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const courses = searchCourses(query);
  const [priceRange, setPriceRange] = useState([0, 2000000]);

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Tìm kiếm", isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container py-8 md:py-12">
        <AppBreadcrumb items={breadcrumbItems} />

        <PageHeader 
          title={`Kết quả tìm kiếm của bạn ${query ? `cho "${query}"` : ""}`}
          description={`Tìm thấy ${courses.length} khóa học phù hợp với yêu cầu của bạn.`}
        />

        <CourseListSection
          courses={courses}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          emptyMessage="Rất tiếc, chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa của bạn."
        />
      </div>
    </div>
  );
};

export default SearchPage;
