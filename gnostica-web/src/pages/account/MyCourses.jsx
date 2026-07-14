import React from "react";
import { Search, BookOpen, Trophy, Clock } from "lucide-react";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppInput from "@/components/common/micro/AppInput";
import AppSelect from "@/components/common/micro/AppSelect";
import { AppCheckbox } from "@/components/common/micro/AppCheckbox";
import { Skeleton } from "@/components/ui/skeleton";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import useMyCourses from "@/hooks/course/useMyCourses";
import MyCourseGrid from "@/pages/account/components/MyCourseGrid";

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
    categories,
    stats
  } = useMyCourses();

  const handleCategoryToggle = (category) => {
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
        description={`Bạn đang có tổng cộng ${courses.length} khóa học trong thư viện. Hãy theo dõi quá trình học tập của mình.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <AppCard key={i} appVariant="default" className="shadow-sm">
              <AppCardContent className="p-5 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
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
          <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex-1">
              <AppInput 
                icon={Search}
                placeholder="Tìm kiếm khóa học..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                containerClassName="w-full"
                className="bg-muted focus:bg-white"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <AppSelect 
                value={statusFilter} 
                onValueChange={setStatusFilter}
                placeholder="Trạng thái"
                className="bg-muted focus:bg-white border-none"
                options={[
                  { label: "Tất cả trạng thái", value: "all" },
                  { label: "Chưa bắt đầu", value: "not_started" },
                  { label: "Đang học", value: "in_progress" },
                  { label: "Đã hoàn thành", value: "completed" },
                ]}
              />
            </div>
          </div>
          
          <MyCourseGrid loading={loading} courses={courses} />
        </div>

        {/* Right Column: Filters Sidebar */}
        <div className="space-y-6">
          <AppCard appVariant="default" className="sticky top-24 p-5 shadow-sm">
            <h3 className="font-bold text-foreground text-base mb-4">Danh mục khóa học</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <AppCheckbox
                  key={category}
                  id={`cat-${category}`}
                  label={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
              ))}
              {categories.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">Không có danh mục nào.</p>
              )}
            </div>
          </AppCard>
        </div>
        
      </div>
    </div>
  );
}
