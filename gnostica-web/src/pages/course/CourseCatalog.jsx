import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "@/components/common/core/PageContainer";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/common/micro/AppTabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/common/micro/AppCarousel";
import CourseCard from "@/components/common/composite/CourseCard";
import Skeleton from "@/components/common/micro/AppSkeleton";
import useFeaturedCourses from "@/hooks/course/useFeaturedCourses";
import useRecommendedCourses from "@/hooks/course/useRecommendedCourses";
import { useRecentSearchHistory } from "@/hooks/useRecentSearchHistory";
import useAuthStore from "@/store/useAuthStore";
import { popularCoursesMock } from "@/mocks/courses";
import { ChevronRight } from "lucide-react";

// Mock "thịnh hành" = reversed order for differentiation
const trendingCoursesMock = [...popularCoursesMock].reverse();

const TABS = [
  { value: "popular", label: "Phổ biến nhất" },
  { value: "trending", label: "Thịnh hành" },
];

const formatCoursePrice = (value) => {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("vi-VN").format(Number(value) || 0);
};

const normalizeCourseCard = (course) => ({
  ...course,
  image: course.image || course.thumbnail,
  category: course.category || course.categoryName || "Khóa học",
  price: formatCoursePrice(course.salePrice ?? course.price),
  originalPrice: course.originalPrice
    || (course.discount > 0 ? formatCoursePrice(course.price) : null),
  discountPercentage: course.discountPercentage ?? course.discount ?? 0,
  instructor: course.instructor || {
    name: course.instructorName || "Giảng viên Gnostica",
    avatar: course.instructorAvatar,
    status: "online",
  },
  link: course.link || `/courses/${course.slug || course.id}`,
});

function FeaturedCourseCarousel({ courses }) {
  return (
    <Carousel
      opts={{ align: "start", loop: courses.length > 4 }}
      className="w-full"
    >
      <CarouselContent className="-ml-4 items-stretch py-1">
        {courses.map((rawCourse) => {
          const course = normalizeCourseCard(rawCourse);
          return (
          <CarouselItem
            key={course.id}
            className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
          >
            <div className="h-full p-px">
              <CourseCard {...course} className="h-full" />
            </div>
          </CarouselItem>
          );
        })}
      </CarouselContent>
      {courses.length > 4 && (
        <>
          <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-background/90 shadow text-foreground hover:bg-background z-10 border-border" />
          <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-background/90 shadow text-foreground hover:bg-background z-10 border-border" />
        </>
      )}
    </Carousel>
  );
}

function CourseShelf({ title, courses, loading, viewAllTo = "/search" }) {
  if (!loading && !courses.length) return null;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
        <h2 className="app-section-title">{title}</h2>
        <Link
          to={viewAllTo}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Xem tất cả
          <ChevronRight className="size-4" />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border p-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <FeaturedCourseCarousel courses={courses} />
      )}
    </section>
  );
}

// ── Page ──
export default function CourseCatalog() {
  const [activeTab, setActiveTab] = useState("popular");
  const user = useAuthStore((state) => state.user);
  const { courses: publicCourses, loading: publicCoursesLoading } = useFeaturedCourses(12);
  const { courses: recommendedCourses, loading: recommendationsLoading } = useRecommendedCourses(8);
  const historyCourses = [...publicCourses, ...popularCoursesMock];
  const { recentCourses } = useRecentSearchHistory(user?.id || "guest", historyCourses);
  const relatedCategory = recentCourses[0]?.categoryName
    || recentCourses[0]?.category
    || recommendedCourses[0]?.categoryName
    || recommendedCourses[0]?.category;
  const relatedCourses = relatedCategory
    ? publicCourses.filter((course) => (course.categoryName || course.category) === relatedCategory)
    : [];

  return (
    <div className="app-container py-8 md:py-12 bg-background">
      <PageContainer.Header
        title={<>Khám phá các <span className="text-accent-highlight">Khóa học</span></>}
        description="Khám phá các khóa học đa dạng được thiết kế để giúp bạn làm chủ các kỹ năng mới và thăng tiến trong sự nghiệp."
      >
        <AppBreadcrumb paths={[{ label: "Khóa học" }]} />
      </PageContainer.Header>

      {/* Tabbed Popular / Trending Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12 w-full">
        <TabsList className="mb-6">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="popular" className="animate-in fade-in duration-300">
          <FeaturedCourseCarousel courses={popularCoursesMock} />
        </TabsContent>

        <TabsContent value="trending" className="animate-in fade-in duration-300">
          <FeaturedCourseCarousel courses={trendingCoursesMock} />
        </TabsContent>
      </Tabs>

      <div className="space-y-12 md:space-y-16">
        <CourseShelf
          title="Gợi ý cho bạn"
          courses={recommendedCourses}
          loading={recommendationsLoading}
        />
        <CourseShelf
          title="Cùng lĩnh vực"
          courses={relatedCourses}
          loading={publicCoursesLoading}
          viewAllTo={relatedCategory ? `/search?q=${encodeURIComponent(relatedCategory)}` : "/search"}
        />
        <CourseShelf
          title="Đã xem gần đây"
          courses={recentCourses}
        />
      </div>
    </div>
  );
}
