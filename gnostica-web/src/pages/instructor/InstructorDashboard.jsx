import React from "react";
import { Link } from "react-router-dom";
import { AppButton } from "@/components/common/micro/AppButton";
import { Loader2 } from "lucide-react";
import useInstructorDashboard from "@/hooks/dashboard/useInstructorDashboard";

// Components
import StatsGrid from "@/pages/instructor/components/StatsGrid";
import RevenueChart from "@/pages/instructor/components/RevenueChart";
import RatingDistribution from "@/pages/instructor/components/RatingDistribution";
import StudentGrowthChart from "@/pages/instructor/components/StudentGrowthChart";
import PendingTasks from "@/pages/instructor/components/PendingTasks";
import CoursePerformanceTable from "@/pages/instructor/components/CoursePerformanceTable";

export default function InstructorDashboard() {
  const { data, loading } = useInstructorDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { REVENUE_DATA, STUDENT_GROWTH_DATA, RATING_DISTRIBUTION, COURSE_PERFORMANCE, PENDING_TASKS, STATS } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tổng Quan Giảng Viên</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi hiệu suất và tăng trưởng của các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <div className="flex gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost" className="border border-border">Xuất báo cáo</AppButton>
          <Link to="/instructor/courses/courses-form">
            <AppButton appVariant="gradient" className="bg-success/10 text-success hover:bg-success/20 font-bold">
              Tạo Khóa Học Mới
            </AppButton>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={STATS} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <RevenueChart data={REVENUE_DATA} />

        {/* Rating Distribution */}
        <RatingDistribution data={RATING_DISTRIBUTION} />
      </div>

      {/* Student Growth Chart (Pending Tasks hidden for now) */}
      <div className="grid grid-cols-1 gap-6">
        <StudentGrowthChart data={STUDENT_GROWTH_DATA} />
      </div>

      {/* Student Performance Table */}
      <CoursePerformanceTable courses={COURSE_PERFORMANCE} />

    </div>
  );
}
