import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { ChevronRight, BookOpen, PlayCircle } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import { PageContainer } from "@/components/common/core/PageContainer";
import useAuthStore from "@/store/useAuthStore";
import AccountWelcomeBanner from "@/pages/account/components/AccountWelcomeBanner";
import AccountStatsCards from "@/pages/account/components/AccountStatsCards";
import RecentCertificatesList from "@/pages/account/components/RecentCertificatesList";
import useAccountOverview from "@/hooks/user/useAccountOverview";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseProgressCard } from "@/components/common/composite/CourseCard";
import AppPagination from "@/components/common/micro/AppPagination";

export default function AccountOverview() {
  const [currentPage, setCurrentPage] = useState(1);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const isInstructor = (user?.role || '').toUpperCase() === 'INSTRUCTOR';

  const { stats, recentCourses, recentCertificates, loading } = useAccountOverview();

  const handleBecomeInstructor = () => {
    navigate('/apply-instructor');
  };

  return (
    <div className="space-y-6">
      <PageContainer.Header 
        title="Tổng quan học tập"
        actions={
          <Link to="/courses">
            <AppButton appVariant="gradient" className="w-full sm:w-auto font-bold gap-2">
              Khám phá khóa học mới
            </AppButton>
          </Link>
        }
      >
        <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Tổng quan" }]} />
      </PageContainer.Header>

      <AccountWelcomeBanner 
        user={user} 
        isInstructor={isInstructor} 
        handleBecomeInstructor={handleBecomeInstructor} 
      />

      <AccountStatsCards stats={stats} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Tiếp tục học tập</h2>
            <Link to="/account/my-courses" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                    <Skeleton className="w-full sm:w-40 h-28 sm:h-24 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex items-center gap-4 pt-4">
                        <Skeleton className="h-2 flex-1" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentCourses.length === 0 ? (
            <div className="space-y-4">
              <Card className="border-dashed border-2 bg-muted shadow-none">
                <CardContent className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Bạn chưa đăng ký khóa học nào</p>
                    <p className="text-sm text-muted-foreground mt-1">Hãy khám phá các khóa học hấp dẫn trên Gnostica</p>
                  </div>
                  <Link to="/courses">
                    <AppButton appVariant="gradient" className="mt-2 font-bold bg-transparent text-primary border border-primary hover:bg-primary/5">Khám phá ngay</AppButton>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <CourseProgressCard
                    key={course.id}
                    id={course.id}
                    title={course.courseTitle}
                    category={course.category}
                    image={course.thumbnail}
                    instructor={course.instructor}
                    progressPercent={course.progressPercent}
                    lastAccessed={course.lastAccessed}
                    link={`/courses/${course.slug}/learn`}
                  />
                ))}
              </div>
              <AppPagination 
                currentPage={currentPage}
                totalPages={5}
                onPageChange={setCurrentPage}
                className="pt-2 border-t border-border/50"
              />
            </div>
          )}
        </div>

        {/* Right Column: Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Chứng chỉ mới nhất</h2>
            <Link to="/account/certificates" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <RecentCertificatesList loading={loading} recentCertificates={recentCertificates} />
        </div>
        
      </div>
    </div>
  );
}
