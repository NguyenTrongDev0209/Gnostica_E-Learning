import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppBreadcrumb from "@/components/common/micro/AppBreadcrumb";
import { ChevronRight, BookOpen, Trophy, Award, Clock, LayoutDashboard } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import useAuthStore from "@/store/useAuthStore";
import useAccountOverview from "@/hooks/user/useAccountOverview";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import AppSkeleton from "@/components/common/micro/AppSkeleton";
import { CourseProgressCard } from "@/components/common/composite/CourseCard";
import AppPagination from "@/components/common/micro/AppPagination";
import AppPageHeader from "@/components/common/composite/AppPageHeader";
import { AppDialog } from "@/components/common/micro/AppDialog";
import ApplyInstructor from "@/pages/general/ApplyInstructor";

export default function AccountOverview() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false);
  const [instructorDialogMode, setInstructorDialogMode] = useState("intro");
  const user = useAuthStore(state => state.user);
  const isInstructor = (user?.role || '').toUpperCase() === 'INSTRUCTOR';

  const { stats, recentCourses, recentCertificates, loading } = useAccountOverview();

  const handleBecomeInstructor = () => {
    setInstructorDialogMode("intro");
    setIsInstructorDialogOpen(true);
  };

  const handleConfirmBecomeInstructor = () => {
    setInstructorDialogMode("form");
  };

  return (
    <div className="space-y-6">
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Tổng quan" }]} />

      <AppPageHeader
        icon={LayoutDashboard}
        title="Tổng quan học tập"
        description="Theo dõi nhanh các khóa học, chứng chỉ và tiến độ học tập gần đây của bạn."
        actions={
          <Link to="/courses">
            <AppButton appVariant="gradient" className="w-full sm:w-auto font-bold gap-2">
              Khám phá khóa học mới
            </AppButton>
          </Link>
        }
      />

      <AccountWelcomeBanner 
        user={user} 
        isInstructor={isInstructor} 
        handleBecomeInstructor={handleBecomeInstructor} 
      />

      <InstructorApplicationDialog
        open={isInstructorDialogOpen}
        mode={instructorDialogMode}
        onOpenChange={(open) => {
          setIsInstructorDialogOpen(open);
          if (!open) setInstructorDialogMode("intro");
        }}
        onConfirm={handleConfirmBecomeInstructor}
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
                <AppCard key={i} appVariant="default" className="border-border shadow-sm">
                  <AppCardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                    <AppSkeleton className="w-full sm:w-40 h-28 sm:h-24 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <AppSkeleton className="h-6 w-3/4" />
                      <AppSkeleton className="h-3 w-1/2" />
                      <div className="flex items-center gap-4 pt-4">
                        <AppSkeleton className="h-2 flex-1" />
                        <AppSkeleton className="w-10 h-10 rounded-full" />
                      </div>
                    </div>
                  </AppCardContent>
                </AppCard>
              ))}
            </div>
          ) : recentCourses.length === 0 ? (
            <div className="space-y-4">
              <AppCard appVariant="default" className="border-dashed border-2 bg-muted shadow-none">
                <AppCardContent className="p-10 text-center space-y-4">
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
                </AppCardContent>
              </AppCard>
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
                    link={`/learning/${course.slug}`}
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

function AccountWelcomeBanner({ user, isInstructor, handleBecomeInstructor }) {
  return (
    <>
      <AppCard appVariant="default" className="border-none shadow-sm bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 text-white mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-32 h-32" />
        </div>
        <AppCardContent className="p-6 md:p-8 relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
            Chào mừng trở lại, {user?.fullName || "Học viên"}!
          </h2>
          <p className="text-slate-200 text-sm leading-relaxed max-w-xl">
            Tiếp tục hành trình chinh phục kiến thức mới hôm nay nhé. Mỗi phút học tập đều đưa bạn đến gần hơn với mục tiêu!
          </p>
        </AppCardContent>
      </AppCard>

      {!isInstructor && (
        <AppCard appVariant="default" className="border-2 border-dashed border-warning/20 bg-orange-50/50 mb-6 group cursor-pointer hover:bg-orange-50 transition-colors" onClick={handleBecomeInstructor}>
          <AppCardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Chia sẻ kiến thức, tạo nguồn thu nhập</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Đăng ký trở thành giảng viên trên Gnostica ngay hôm nay.</p>
              </div>
            </div>
            <AppButton appVariant="gradient" variant="outline" className="border-warning/20 text-white hover:bg-warning/10 hover:text-white shrink-0 font-bold hidden sm:flex">
              Đăng ký ngay
            </AppButton>
          </AppCardContent>
        </AppCard>
      )}
    </>
  );
}

function InstructorApplicationDialog({ open, mode, onOpenChange, onConfirm }) {
  const isFormMode = mode === "form";

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={!isFormMode ? "Đăng ký trở thành giảng viên" : undefined}
      description={!isFormMode ? "Chia sẻ kiến thức của bạn với cộng đồng Gnostica và xây dựng nguồn thu nhập từ các khóa học chất lượng." : undefined}
      className={isFormMode ? "sm:!max-w-3xl max-h-[86vh] overflow-y-auto overflow-x-hidden bg-white" : "sm:max-w-md bg-white"}
      footer={!isFormMode ? (
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AppButton
              appVariant="ghostMuted"
              variant="ghost"
              className="border border-border font-bold"
              onClick={() => onOpenChange(false)}
            >
              Để sau
            </AppButton>
            <AppButton appVariant="gradient" className="font-bold text-white" onClick={onConfirm}>
              Tiếp tục đăng ký
            </AppButton>
          </div>
        ) : undefined
      }
    >
      {isFormMode ? (
        <ApplyInstructor embedded onSubmitted={() => onOpenChange(false)} />
      ) : (
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="rounded-lg border border-warning/20 bg-orange-50 p-4">
            <p className="font-bold text-foreground">Bạn sẽ cần chuẩn bị:</p>
            <ul className="mt-2 space-y-1.5">
              <li>Thông tin cá nhân và kinh nghiệm giảng dạy.</li>
              <li>Chủ đề khóa học bạn muốn xây dựng.</li>
              <li>Tài liệu minh chứng hoặc hồ sơ chuyên môn nếu có.</li>
            </ul>
          </div>
          <p>Quá trình xét duyệt giúp đảm bảo chất lượng nội dung trước khi khóa học được mở cho học viên.</p>
        </div>
      )}
    </AppDialog>
  );
}

function AccountStatsCards({ stats, loading }) {
  const statItems = [
    { 
      label: "Khóa học đang học", 
      value: stats?.enrolledCourses || "0", 
      icon: BookOpen, 
      color: "text-info bg-blue-50" 
    },
    { 
      label: "Chứng chỉ đạt được", 
      value: stats?.completedCourses || "0", 
      icon: Award, 
      color: "text-emerald-500 bg-emerald-50" 
    },
    { 
      label: "Số giờ đã học", 
      value: stats?.hoursStudied?.toFixed(1) || "0", 
      icon: Clock, 
      color: "text-purple-500 bg-purple-50" 
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Array(3).fill(0).map((_, i) => (
          <AppCard key={i} appVariant="default" className="border-border shadow-sm">
            <AppCardContent className="p-5 flex items-center gap-4">
              <AppSkeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <AppSkeleton className="h-6 w-12" />
                <AppSkeleton className="h-3 w-24" />
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <AppCard key={stat.label} appVariant="default" className="border-border shadow-sm hover:shadow-md transition-shadow">
            <AppCardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </AppCardContent>
          </AppCard>
        );
      })}
    </div>
  );
}

function RecentCertificatesList({ loading, recentCertificates }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2).fill(0).map((_, i) => (
          <AppSkeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (recentCertificates.length === 0) {
    return (
      <div className="space-y-4">
        <AppCard appVariant="default" className="border-dashed border-2 bg-transparent shadow-none border-border">
          <AppCardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Hoàn thành thêm khóa học để nhận chứng chỉ
            </p>
          </AppCardContent>
        </AppCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentCertificates.map((cert) => (
        <div 
          key={cert.id} 
          className={`p-5 rounded-2xl bg-gradient-to-br ${cert.color} text-white shadow-lg relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
          <Award className="w-8 h-8 text-white/80 mb-3" />
          <h3 className="font-bold text-lg leading-tight mb-4">{cert.title}</h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-medium text-white/80">Cấp ngày: {cert.date}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
