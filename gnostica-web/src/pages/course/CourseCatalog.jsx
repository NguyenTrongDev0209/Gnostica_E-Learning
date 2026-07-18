import React, { useState } from "react";
import { useParams } from "react-router-dom";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import CourseCard, { CourseCardHorizontal } from "@/components/common/composite/CourseCard";
import { DataFilterSidebar } from "@/components/common/composite/DataFilter";
import { AppSheetRoot as Sheet, AppSheetContent as SheetContent, AppSheetTrigger as SheetTrigger } from "@/components/common/micro/AppSheet";
import { Button } from "@/components/common/micro/AppButton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/common/micro/AppPagination";
import { Loader2, SearchX, Home } from "lucide-react";
import useCategories from "@/hooks/course/useCategories";
import useCourses from "@/hooks/course/useCourses";
import { popularCoursesMock } from "@/mocks/courses";

// Mock "thịnh hành" = reversed order for differentiation
const trendingCoursesMock = [...popularCoursesMock].reverse();

const TABS = ["Phổ biến nhất", "Thịnh hành"];

// ── CourseListSection ──
function CourseListSection({
  courses = [],
  loading = false,
  categories = [],
  filters,
  onFilterChange,
  pagination,
  onPageChange,
  emptyMessage,
  sectionTitle
}) {
  // Tạo mảng các trang để hiển thị trong pagination
  const renderPaginationItems = () => {
    const items = [];
    const { page, totalPages } = pagination;

    for (let i = 0; i < totalPages; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={page === i}
            className="cursor-pointer"
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24">
          <DataFilterSidebar
            categories={categories}
            selectedFilters={filters}
            onFilterChange={onFilterChange}
          />
        </div>
      </aside>

      {/* Course List Area */}
      <div className="flex flex-col gap-6 lg:gap-10 lg:col-span-9">
        {/* Mobile Heading */}
        <div className="flex lg:hidden items-center justify-between">
          <h3 className="text-lg font-bold">{sectionTitle || 'Danh sách khóa học'}</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 px-4 flex items-center gap-2 bg-white shadow-sm border-border">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto p-4 bg-muted border-l-slate-200">
              <DataFilterSidebar
                categories={categories}
                selectedFilters={filters}
                onFilterChange={onFilterChange}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content (Loading or Cards) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-warning" />
            <p className="font-medium animate-pulse">Đang tải danh sách khóa học...</p>
          </div>
        ) : courses.length > 0 ? (
          <>
            {sectionTitle && (
              <h3 className="hidden lg:block text-xl font-bold text-foreground">{sectionTitle}</h3>
            )}
            <div className="flex flex-col gap-4">
              {courses.map((course) => (
                <CourseCardHorizontal
                  key={course.id}
                  id={course.id}
                  image={course.thumbnail}
                  title={course.title}
                  price={new Intl.NumberFormat("vi-VN").format(course.salePrice)}
                  originalPrice={course.discount > 0 ? new Intl.NumberFormat("vi-VN").format(course.price) : null}
                  discountPercentage={course.discount}
                  category={course.categoryName || course.category?.name || "Chưa phân loại"}
                  link={`/courses/${course.slug || course.id}`}
                  classes={course.classes || 0}
                  students={course.students || 0}
                  instructor={{
                    name: course.instructorName || "Giảng viên",
                    avatar: course.instructorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
                    status: "online"
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => pagination.page > 0 && onPageChange(pagination.page - 1)}
                        className={pagination.page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {renderPaginationItems()}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => pagination.page < pagination.totalPages - 1 && onPageChange(pagination.page + 1)}
                        className={pagination.page === pagination.totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-border">
            <div className="bg-muted rounded-full p-6 mb-4">
              <SearchX className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">{emptyMessage}</p>
            <Button
              variant="outline"
              className="mt-6 font-bold border-border"
              onClick={() => {
                onFilterChange("categoryId", null);
                onFilterChange("level", "all");
              }}
            >
              Xóa các bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──
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
            <Button
              variant="ghost"
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-5 py-3 text-sm font-semibold transition-all relative
                ${activeTab === idx
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </Button>
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
