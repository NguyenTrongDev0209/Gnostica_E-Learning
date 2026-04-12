import React from "react";
import AppCard from "@/components/common/AppCard";
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

export default function CourseListSection({ courses, priceRange, setPriceRange, emptyMessage }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24">
          <FilterOptions priceRange={priceRange} onPriceRangeChange={setPriceRange} />
        </div>
      </aside>

      <div className="flex flex-col gap-6 lg:gap-10 lg:col-span-9">
        <div className="flex lg:hidden items-center justify-between">
          <h3 className="text-lg font-bold">Danh sách khóa học</h3>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-10 px-4 flex items-center gap-2 bg-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Lọc
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto p-4 bg-slate-50">
              <FilterOptions priceRange={priceRange} onPriceRangeChange={setPriceRange} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 9).map((course) => (
            <AppCard 
              key={course.id} 
              image={course.thumbnail}
              title={course.title}
              price={new Intl.NumberFormat("vi-VN").format(course.salePrice)}
              originalPrice={course.discount > 0 ? new Intl.NumberFormat("vi-VN").format(course.price) : null}
              discountPercentage={course.discount}
              category={course.categoryId ? "Category ID: " + course.categoryId : "Dân chuyên"}
              link={`/courses/${course.slug || course.id}`}
              classes={course.modules?.length || 0}
              students={0}
              instructor={{
                 name: course.account?.fullName || "Giảng viên",
                 avatar: course.account?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
                 status: "online"
              }}
            />
          ))}
        </div>

        {courses.length > 0 ? (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted rounded-full p-6 mb-4">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
