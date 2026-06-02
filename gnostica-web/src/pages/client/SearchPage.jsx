import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AppBreadcrumb, PageHeader } from "@/components/common/AppSection";
import CourseListSection from "@/components/pages/client/shared/CourseListSection";
import { Home } from "lucide-react";
import courseService from "@/services/courseService";
import categoryService from "@/services/categoryService";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: "all",
    categorySlug: null,
    categoryId: null
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 9,
    totalElements: 0,
    totalPages: 0
  });

  // Fetch categories for sidebar
  useEffect(() => {
    categoryService.getAllCategories(1, 100).then(data => {
      if (data && data.content) {
        setCategories(data.content);
      }
    }).catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Fetch courses when query, filters, or page changes
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await courseService.getPublicCourses({
          search: query,
          level: filters.level,
          categorySlug: filters.categorySlug,
          categoryId: filters.categoryId,
          page: pagination.page,
          size: pagination.size
        });

        if (response) {
          setCourses(response.content || []);
          setPagination(prev => ({
            ...prev,
            totalElements: response.totalElements || 0,
            totalPages: response.totalPages || 0
          }));
        }
      } catch (error) {
        console.error("Error searching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [query, filters, pagination.page]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Nếu set categorySlug thì xoá categoryId và ngược lại để tránh xung đột
      if (key === 'categorySlug' && value) newFilters.categoryId = null;
      if (key === 'categoryId' && value) newFilters.categorySlug = null;
      return newFilters;
    });
    setPagination(prev => ({ ...prev, page: 0 })); // Reset page when filters change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
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
          description={loading ? "Đang tìm kiếm khóa học..." : `Tìm thấy ${pagination.totalElements} khóa học phù hợp với yêu cầu của bạn.`}
        />

        <CourseListSection
          courses={courses}
          loading={loading}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          emptyMessage="Rất tiếc, chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa của bạn."
          sectionTitle="Kết quả tìm kiếm"
        />
      </div>
    </div>
  );
};

export default SearchPage;
