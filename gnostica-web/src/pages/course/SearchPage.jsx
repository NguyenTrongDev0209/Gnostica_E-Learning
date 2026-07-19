import React, { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { DataFilterSidebar } from "@/components/common/composite/DataFilter";
import CourseCard, { CourseCardHorizontal } from "@/components/common/composite/CourseCard";
import { AppSheetRoot as Sheet, AppSheetContent as SheetContent, AppSheetTrigger as SheetTrigger } from "@/components/common/micro/AppSheet";
import { Button } from "@/components/common/micro/AppButton";
import AppPagination from "@/components/common/micro/AppPagination";
import { Loader2, SearchX } from "lucide-react";
import { useSearch } from "@/hooks/course/useSearch";

// ── CourseListSection ──
export function CourseResultsLayout({
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Sidebar Filters */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24">
          <DataFilterSidebar
            key={`desktop-filter-${filters?.priceRange?.join("-")}`}
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
                key={`mobile-filter-${filters?.priceRange?.join("-")}`}
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
              <AppPagination
                className="mt-8"
                currentPage={pagination.page + 1}
                totalPages={pagination.totalPages}
                onPageChange={(nextPage) => onPageChange(nextPage - 1)}
              />
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
                onFilterChange("categorySlugs", []);
                onFilterChange("levels", []);
                onFilterChange("priceRange", [0, 2000000]);
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
const SearchPageContent = ({ categorySlug }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [filters, setFilters] = useState({
    levels: [],
    categorySlugs: categorySlug ? [categorySlug] : [],
    categoryId: null,
    priceRange: [0, 2000000]
  });
  
  const [page, setPage] = useState(0);
  const size = 5;

  const { courses, suggestedCourses, categories, loading, suggestionsLoading, totalElements, totalPages } = useSearch(query, filters, { page, size });

  const paginationInfo = { page, size, totalElements, totalPages };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'categorySlugs' && value?.length) newFilters.categoryId = null;
      if (key === 'categoryId' && value) newFilters.categorySlugs = [];
      return newFilters;
    });
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayCategory = categorySlug
    ? categorySlug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    : null;

  const breadcrumbItems = displayCategory
    ? [{ label: "Khóa học", href: "/courses" }, { label: displayCategory }]
    : [{ label: query ? "Tìm kiếm" : "Khóa học" }];

  return (
    <div className="min-h-screen bg-background">
      <div className="app-container py-8 md:py-12">
        <PageContainer.Header
          title={displayCategory ? `Khóa học ${displayCategory}` : `Kết quả tìm kiếm ${query ? `cho "${query}"` : ""}`}
          description={loading ? "Đang tìm kiếm khóa học..." : `Tìm thấy ${totalElements} khóa học phù hợp với yêu cầu của bạn.`}
        >
          <AppBreadcrumb paths={breadcrumbItems} />
        </PageContainer.Header>

        <CourseResultsLayout
          courses={courses}
          loading={loading}
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          pagination={paginationInfo}
          onPageChange={handlePageChange}
          emptyMessage="Rất tiếc, chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa của bạn."
          sectionTitle={displayCategory ? `Tất cả khóa học ${displayCategory}` : "Kết quả tìm kiếm"}
        />

        {query.trim() && (suggestionsLoading || suggestedCourses.length > 0) && (
          <section className="mt-12 md:mt-16" aria-labelledby="search-suggestions-title">
            <div className="border-b border-border pb-3 mb-5">
              <h2 id="search-suggestions-title" className="text-2xl font-bold text-foreground">Gợi ý tìm kiếm</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Các khóa học gần với nội dung “{query}” mà bạn có thể quan tâm.
              </p>
            </div>

            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                Đang tìm khóa học liên quan...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {suggestedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    image={course.thumbnail}
                    title={course.title}
                    price={new Intl.NumberFormat("vi-VN").format(course.salePrice)}
                    originalPrice={course.discount > 0 ? new Intl.NumberFormat("vi-VN").format(course.price) : null}
                    discountPercentage={course.discount}
                    category={course.categoryName || course.category?.name || "Chưa phân loại"}
                    link={`/courses/${course.slug || course.id}`}
                    classes={course.classes || 0}
                    students={course.students || 0}
                    rating={course.rating || 4.9}
                    instructor={{ name: course.instructorName || "Giảng viên", avatar: course.instructorAvatar, status: "online" }}
                    className="h-full"
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const { categorySlug } = useParams();
  const { search } = useLocation();
  return <SearchPageContent key={`${categorySlug || "search"}:${search}`} categorySlug={categorySlug} />;
};

export default SearchPage;
