import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppBreadcrumb, PageHeader } from "@/components/common/AppSection";
import CourseListSection from "@/pages/client/components/shared/CourseListSection";
import { Home } from "lucide-react";
import { useSearch } from "@/hooks/course/useSearch";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [filters, setFilters] = useState({
    level: "all",
    categorySlug: null,
    categoryId: null
  });
  
  const [page, setPage] = useState(0);
  const size = 9;

  const { courses, categories, loading, totalElements, totalPages } = useSearch(query, filters, { page, size });

  const paginationInfo = { page, size, totalElements, totalPages };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'categorySlug' && value) newFilters.categoryId = null;
      if (key === 'categoryId' && value) newFilters.categorySlug = null;
      return newFilters;
    });
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Tìm kiếm", isLast: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container py-8 md:py-12">
        <AppBreadcrumb items={breadcrumbItems} />

        <PageHeader
          title={`Kết quả tìm kiếm ${query ? `cho "${query}"` : ""}`}
          description={loading ? "Đang tìm kiếm khóa học..." : `Tìm thấy ${totalElements} khóa học phù hợp với yêu cầu của bạn.`}
        />

        <CourseListSection
          courses={courses}
          loading={loading}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          pagination={paginationInfo}
          onPageChange={handlePageChange}
          emptyMessage="Rất tiếc, chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa của bạn."
          sectionTitle="Kết quả tìm kiếm"
        />
      </div>
    </div>
  );
};

export default SearchPage;
