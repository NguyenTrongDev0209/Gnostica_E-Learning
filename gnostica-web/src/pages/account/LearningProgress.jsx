import React from "react";
import { Link } from "react-router-dom";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppProgress from "@/components/common/micro/AppProgress";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import { AppButton } from "@/components/common/micro/AppButton";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import useLearningProgress from "@/hooks/account/useLearningProgress";
import {
  Activity,
  Trophy,
  BookOpen,
  Clock,
} from "lucide-react";
export default function LearningProgress() {
  const { courses, stats, loading } = useLearningProgress();

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
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Tiến độ học tập" }]} />

      <AppPageHeader
        icon={Activity}
        title="Tiến độ học tập"
        description="Theo dõi quá trình học tập và hoàn thành mục tiêu của bạn."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <AppCard key={i} appVariant="default" className="border-none shadow bg-card">
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
              <AppCard key={stat.label} appVariant="default" className="border-none shadow bg-card">
                <AppCardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</p>
                  </div>
                </AppCardContent>
              </AppCard>
            );
          })
        )}
      </div>

      {/* Detailed Progress List */}
      <LearningProgressList loading={loading} courses={courses} />
    </div>
  );
}

function LearningProgressList({ loading, courses }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2).fill(0).map((_, i) => (
          <AppCard key={i} appVariant="default" className="shadow-sm">
            <AppCardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <AppSkeleton className="h-6 w-1/2" />
                  <div className="flex gap-4">
                    <AppSkeleton className="h-4 w-24" />
                    <AppSkeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-2">
                    <AppSkeleton className="h-2 w-full" />
                  </div>
                </div>
                <AppSkeleton className="h-10 w-24 rounded-lg" />
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <AppCard appVariant="default" className="border-dashed border-2 bg-muted shadow-none text-center p-10 border-border">
        <p className="text-muted-foreground">Bạn chưa đăng ký khóa học nào.</p>
        <Link to="/courses" className="text-primary font-bold hover:underline mt-2 inline-block">
          Khám phá khóa học ngay
        </Link>
      </AppCard>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <AppCard key={course.id} appVariant="default" className="shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <AppCardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Info Section */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">{course.courseTitle}</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted"></span>
                    Bài viết: <strong className="text-foreground">{course.completedLessons || Math.floor((course.progressPercent / 100) * 45)}/{course.totalLessons || 45}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted"></span>
                    Tham gia: <strong className="text-foreground">{course.joinedAt ? new Date(course.joinedAt).toLocaleDateString('vi-VN') : (course.lastAccessed ? new Date(course.lastAccessed).toLocaleDateString('vi-VN') : 'Gần đây')}</strong>
                  </span>
                  {course.completedAt && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      Hoàn thành: <strong className="text-foreground">{new Date(course.completedAt).toLocaleDateString('vi-VN')}</strong>
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Tiến độ tổng thể</span>
                    <span className={`text-lg font-bold ${course.progressPercent === 100 ? "text-emerald-500" : "text-primary"}`}>
                      {course.progressPercent}%
                    </span>
                  </div>
                  <AppProgress 
                    value={course.progressPercent} 
                    className={`h-3 bg-secondary ${course.progressPercent === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex md:flex-col gap-3 justify-end items-end border-t border-border pt-4 md:border-0 md:pt-0">
                <Link to={`/learning/${course.courseId}`}>
                  {course.progressPercent === 100 ? (
                    <AppButton appVariant="ghostMuted" variant="ghost" className="px-6 border border-border">Xem lại bài</AppButton>
                  ) : (
                    <AppButton appVariant="gradient" className="px-6 font-bold">Học ngay</AppButton>
                  )}
                </Link>
              </div>
            </div>
          </AppCardContent>
        </AppCard>
      ))}
    </div>
  );
}
