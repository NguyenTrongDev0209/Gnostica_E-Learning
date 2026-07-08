import React from "react";
import StatsGrid from "./components/StatsGrid";
import RevenueCharts from "./components/RevenueCharts";
import RecentOrders from "./components/RecentOrders";
import MemberGrowthChart from "./components/MemberGrowthChart";
import TopCourses from "./components/TopCourses";
import InfrastructureMonitor from "./components/InfrastructureMonitor";
import { useDashboard } from "@/hooks/dashboard/useDashboard";

export default function AdminDashboard() {
  const {
    stats,
    memberGrowth,
    revenueData,
    recentOrders,
    topCourses,
    isLoading
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-info/20 border-t-transparent"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Trung Tâm Quản Trị</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tổng quan hoạt động kinh doanh và hạ tầng của nền tảng Gnostica.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-border">
          <select className="h-9 px-3 py-1 bg-transparent text-sm font-medium focus:outline-none border-none cursor-pointer">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsGrid stats={stats} />

      {/* Financial Section */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-6 bg-info/10 text-info rounded-full"></span>
            Tài chính & Kinh doanh
          </h2>
          <p className="text-sm text-muted-foreground mt-1 pl-3.5">Biến động doanh thu và các giao dịch mới nhất</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RevenueCharts revenueData={revenueData} />
          <RecentOrders orders={recentOrders} />
        </div>
      </div>

      {/* Users & Courses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-success/10 text-success rounded-full"></span>
              Phân tích Thành viên
            </h2>
          </div>
          <MemberGrowthChart data={memberGrowth} />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              Hoạt động Khóa học
            </h2>
          </div>
          <TopCourses data={topCourses} />
        </div>
      </div>

      {/* Infrastructure Monitoring */}
      <InfrastructureMonitor />
    </div>
  );
}
