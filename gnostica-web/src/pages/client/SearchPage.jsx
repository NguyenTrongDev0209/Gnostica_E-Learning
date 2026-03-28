import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppCard from "@/components/common/AppCard";
import AppSection, { PageHeader } from "@/components/common/AppSection";
import FilterOptions from "@/components/common/FilterOptions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const courses = [
  {
    id: 1,
    category: "Web Development",
    rating: 5.0,
    title: "Fullstack Next.js Masterclass",
    classes: 32,
    students: 1200,
    price: "899.000",
    originalPrice: "1.799.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Sonny Sangha",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 2,
    category: "UI/UX Design",
    rating: 4.8,
    title: "Figma Mastery for Professionals",
    classes: 24,
    students: 850,
    price: "299.000",
    originalPrice: "599.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
  {
    id: 3,
    category: "Data Science",
    rating: 4.9,
    title: "Python for Data Science & ML",
    classes: 45,
    students: 3100,
    price: "432.000",
    originalPrice: "864.000",
    discountPercentage: 50,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
    instructor: {
      name: "Alex Taylor",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop",
      status: "online"
    }
  },
];

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <FilterOptions priceRange={priceRange} onPriceRangeChange={setPriceRange} />
            </div>
          </aside>

          {/* Right: Course Grid */}
          <div className="flex flex-col gap-6 lg:gap-10 lg:col-span-9">
            {/* Mobile Filter Trigger */}
            <div className="flex lg:hidden items-center justify-between">
              <h3 className="text-lg font-bold">Danh sách khóa học</h3>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-10 px-4 flex items-center gap-2 bg-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
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
                <AppCard key={course.id} {...course} />
              ))}
            </div>

            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
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

            {courses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted-foreground">
                  Rất tiếc, chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa của bạn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
