import React from "react";
import { BookOpen, Trophy, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppCheckbox } from "@/components/common/micro/AppCheckbox";
import { AppButton } from "@/components/common/micro/AppButton";
import AppPagination from "@/components/common/micro/AppPagination";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import DataFilter, { DataFilterSidebarChecklist } from "@/components/common/composite/DataFilter";
import { CourseProgressCard } from "@/components/common/composite/CourseCard";
import useMyCourses from "@/hooks/course/useMyCourses";

export default function MyCourses() {
  const {
    courses,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedCategories,
    setSelectedCategories,
    dateRange,
    setDateRange,
    categories,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCourses,
    totalFilteredCourses,
    stats
  } = useMyCourses();

  const handleCategoryToggle = (category) => {
    if (category === "CLEAR_ALL") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const overallStats = [
    { 
      label: "Khóa học đăng ký", 
      value: stats?.enrolledCourses || "0", 
      icon: BookOpen, 
      color: "text-info bg-blue-50" 
    },
    { 
      label: "Khóa hoàn thành", 
      value: stats?.completedCourses || "0", 
      icon: Trophy, 
      color: "text-emerald-500 bg-emerald-50" 
    },
    { 
      label: "Tổng giờ đã học", 
      value: `${stats?.hoursStudied?.toFixed(1) || "0"}h`, 
      icon: Clock, 
      color: "text-purple-500 bg-purple-50" 
    },
  ];

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Khóa học của tôi" }]} />

      <AppPageHeader
        icon={BookOpen}
        title="Khóa học của tôi"
        description={`Bạn đang có tổng cộng ${totalCourses} khóa học trong thư viện. Hãy theo dõi quá trình học tập của mình.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <AppCard key={i} appVariant="default" className="shadow-sm">
              <AppCardContent className="p-5 flex items-center gap-4">
                <AppSkeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <AppSkeleton className="h-3 w-20" />
                  <AppSkeleton className="h-6 w-12" />
                </div>
              </AppCardContent>
            </AppCard>
          ))
        ) : (
          overallStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <AppCard key={stat.label} appVariant="default" className="shadow-sm hover:shadow-md transition-shadow">
                <AppCardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-foreground mt-0.5">{stat.value}</p>
                  </div>
                </AppCardContent>
              </AppCard>
            );
          })
        )}
      </div>

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* Left Column: Course Grid */}
        <div className="lg:col-span-2 space-y-6">
          <DataFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Tìm kiếm khóa học..."
            filterValue={statusFilter}
            onFilterChange={setStatusFilter}
            filterPlaceholder="Trạng thái"
            filterOptions={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Chưa bắt đầu", value: "not_started" },
              { label: "Đang học", value: "in_progress" },
              { label: "Đã hoàn thành", value: "completed" },
            ]}
          />
          
          <MyCourseGrid loading={loading} courses={courses} />

          {courses.length > 0 && !loading && (
            <AppPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="pt-4 border-t border-border/50"
            />
          )}
        </div>

        {/* Right Column: Filters Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <DataFilterSidebarChecklist
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              items={categories}
              selectedItems={selectedCategories}
              onItemToggle={handleCategoryToggle}
              emptyMessage={!loading ? "Không có danh mục nào." : "Đang tải..."}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}

function MyCourseGrid({ loading, courses }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(n => (
          <div key={n} className="h-80 bg-secondary animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 bg-muted rounded-lg border border-dashed border-border">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Không tìm thấy khóa học nào</h3>
        <p className="text-muted-foreground mb-6">Bạn chưa sở hữu khóa học nào phù hợp với bộ lọc hiện tại.</p>
        <Link to="/courses">
          <AppButton appVariant="outlineGradient" className="font-bold border-2 border-primary text-primary hover:bg-primary/5">
            Khám phá khóa học
          </AppButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseProgressCard
          key={course.id}
          id={course.id}
          title={course.courseTitle}
          category={course.category}
          image={course.courseThumbnail}
          instructor={course.instructorName}
          progressPercent={course.progressPercent}
          lastAccessed={course.lastAccessed}
          completedAt={course.completedAt}
          joinedAt={course.joinedAt}
          firstLessonId={course.firstLessonId}
          lastWatchedLessonSlug={course.lastWatchedLessonSlug}
          certifiUrl={course.certifiUrl}
          link={`/learning/${course.courseSlug}${course.progressPercent === 100 ? `?lesson=${course.firstLessonId}&restart=true` : (course.lastWatchedLessonSlug ? `?lesson=${course.lastWatchedLessonSlug}` : "")}`}
        />
      ))}
    </div>
  );
}
