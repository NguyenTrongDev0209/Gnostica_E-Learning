import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import useInstructorDashboard from "@/hooks/admin/useInstructorDashboard";

// Components
import StatsGrid from "@/components/pages/instructor/dashboard/StatsGrid";
import RevenueChart from "@/components/pages/instructor/dashboard/RevenueChart";
import RatingDistribution from "@/components/pages/instructor/dashboard/RatingDistribution";
import StudentGrowthChart from "@/components/pages/instructor/dashboard/StudentGrowthChart";
import PendingTasks from "@/components/pages/instructor/dashboard/PendingTasks";
import CoursePerformanceTable from "@/components/pages/instructor/dashboard/CoursePerformanceTable";

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
          <Button variant="outline" className="border-border">Xuất báo cáo</Button>
          <Link to="/instructor/courses/courses-form">
            <Button className="bg-success/10 text-success hover:bg-success/10 text-success text-white shadow-none font-bold">
              Tạo Khóa Học Mới
            </Button>
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

      {/* Student Growth Chart + Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Growth Chart */}
        <StudentGrowthChart data={STUDENT_GROWTH_DATA} />

        {/* Pending Tasks Widget */}
        <PendingTasks tasks={PENDING_TASKS} />
      </div>

      {/* Student Performance Table */}
      <CoursePerformanceTable courses={COURSE_PERFORMANCE} />

    </div>
  );
}
