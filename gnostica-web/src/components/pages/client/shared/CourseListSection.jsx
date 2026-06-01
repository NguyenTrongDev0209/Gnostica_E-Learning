import React from "react";
import AppCard, { CourseCardHorizontal } from "@/components/common/AppCard";
import FilterOptions from "@/components/common/FilterOptions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, SearchX } from "lucide-react";

export default function CourseListSection({
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
          <FilterOptions
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
              <Button variant="outline" className="h-10 px-4 flex items-center gap-2 bg-white shadow-sm border-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto p-4 bg-slate-50 border-l-slate-200">
              <FilterOptions
                categories={categories}
                selectedFilters={filters}
                onFilterChange={onFilterChange}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Content (Loading or Cards) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
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
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="bg-slate-50 rounded-full p-6 mb-4">
              <SearchX className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-slate-500 max-w-xs mx-auto">{emptyMessage}</p>
            <Button
              variant="outline"
              className="mt-6 font-bold border-slate-200"
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
