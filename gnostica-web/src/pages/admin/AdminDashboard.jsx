import React from "react";
import LineChart from "@/components/common/composite/LineChart";
import { ChartDateFilters } from "@/components/common/composite/DataFilter";

import { AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar, ComposedChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/common/micro/AppChart";
import { Link } from "react-router-dom";
import DataTable from "@/components/common/composite/DataTable";

import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import {ArrowUpRight, ArrowDownRight, TrendingUp, Users, BookOpen, ShoppingCart, LayoutDashboard, Download, RefreshCw, FolderTree, UserCheck, Activity, Server} from "lucide-react";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import { useSystemMetrics } from "@/hooks/system/useSystemMetrics";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";
import AppProgress from "@/components/common/micro/AppProgress";

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
      {/* Banner Section */}
      <div className="bg-primary text-primary-foreground rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-lg">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col gap-8">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Trung tâm <span className="text-gradient-button drop-shadow-sm">Quản trị</span>
                </h1>
                <AppBadge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-none font-medium backdrop-blur-sm shadow-none">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </AppBadge>
              </div>
              <p className="text-primary-foreground/90 text-sm md:text-base max-w-xl">
                Theo dõi tổng quan hoạt động kinh doanh và hệ thống của nền tảng.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <AppButton appVariant="default" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-sm" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Đồng bộ
              </AppButton>
              <AppButton appVariant="default" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold shadow-sm" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </AppButton>
            </div>
          </div>

          {/* Stats Grid inside Banner */}
          <StatsGrid stats={stats} />
        </div>
      </div>

      <PlatformOverview stats={stats} />

      {/* Financial Section */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="w-1.5 h-6 bg-info/10 text-info rounded-full"></span>
            Tài chính
          </h2>
          <p className="text-sm text-muted-foreground mt-1 pl-3.5">Biến động doanh thu và các giao dịch mới nhất</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <RevenueCharts revenueData={revenueData} stats={stats} />
          <InstructorRevenueChart revenueData={revenueData} stats={stats} />
        </div>
      </div>

      {/* Users & Courses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-success/10 text-success rounded-full"></span>
              Người dùng
            </h2>
          </div>
          <MemberGrowthChart data={memberGrowth} stats={stats} className="flex-none mb-6" />
          <ViolatingUsersChart />
          <UserRatingsChart />
        </div>
        
        <div className="lg:col-span-1 pt-0 lg:pt-11 flex flex-col space-y-6">
            <TopInstructors />
            <StudentProductivityChart />
            <UserAgeChart />
        </div>
      </div>

      {/* Infrastructure Monitoring */}
      <SystemMonitorCharts />
    </div>
  );
}


function RevenueCharts({ revenueData, stats }) {
    // Tự động tính doanh thu nền tảng và giảng viên nếu chưa có
    const chartData = revenueData?.map(item => {
        const total = item.revenue || 0;
        const instructor = item.instructorRevenue || Math.round(total * 0.6);
        const platform = total - instructor;
        return {
            ...item,
            instructor,
            platform,
            total
        };
    }) || [];

    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng doanh thu:</span>
            <span className="text-2xl font-semibold text-foreground">{(stats?.totalRevenue || 0).toLocaleString()}đ</span>
        </>
    );

    const headerExtra = (
        <ChartDateFilters
            onDateChange={(type, value) => console.log('Date changed:', type, value)}
            onPresetChange={(preset) => console.log('Preset changed:', preset)}
            defaultPreset="6-months"
        />
    );

    const formatYAxis = (value) => `${(value / 1000000).toFixed(0)}M`;

    const revenueConfig = {
        instructor: { label: "Giảng viên", color: "var(--warning)" },
        platform: { label: "Nền tảng", color: "var(--info)" },
        total: { label: "Tổng", color: "var(--primary)" },
    };

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Thống kê Doanh thu</AppCardTitle>
                        <div className="flex items-baseline gap-2">
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {headerExtra}
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                <ChartContainer config={revenueConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            tickFormatter={formatYAxis}
                            dx={-10}
                        />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value.toLocaleString()}đ`} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        <Bar dataKey="instructor" name="Doanh thu Giảng viên" stackId="a" fill="var(--warning)" radius={[0, 0, 4, 4]} maxBarSize={40} />
                        <Bar dataKey="platform" name="Doanh thu Nền tảng" stackId="a" fill="var(--info)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="total" name="Tổng doanh thu" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

function InstructorRevenueChart({ revenueData, stats }) {
    const chartData = revenueData?.map(item => {
        const instructorRevenue = item.instructorRevenue || Math.round((item.revenue || 0) * 0.6);
        const withdrawable = item.withdrawable || Math.round(instructorRevenue * 0.8);
        return {
            ...item,
            instructorRevenue,
            withdrawable
        };
    }) || [];

    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng doanh thu:</span>
            <span className="text-2xl font-semibold text-foreground">{(stats?.instructorRevenue || 0).toLocaleString()}đ</span>
        </>
    );

    const headerExtra = (
        <ChartDateFilters
            onDateChange={(type, value) => console.log('Date changed:', type, value)}
            onPresetChange={(preset) => console.log('Preset changed:', preset)}
            defaultPreset="6-months"
        />
    );

    const formatYAxis = (value) => `${(value / 1000000).toFixed(0)}M`;

    const instructorConfig = {
        instructorRevenue: { label: "Doanh thu", color: "var(--warning)" },
        withdrawable: { label: "Có thể rút", color: "var(--success)" }
    };

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Doanh thu Giảng viên</AppCardTitle>
                        <div className="flex items-baseline gap-2">
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {headerExtra}
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                <ChartContainer config={instructorConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            tickFormatter={formatYAxis}
                            dx={-10}
                        />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value.toLocaleString()}đ`} />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        <Bar dataKey="withdrawable" name="Có thể rút" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="instructorRevenue" name="Doanh thu" stroke="var(--warning)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

function PlatformOverview({ stats }) {
    const data = [
        { title: "Khóa học", value: stats?.totalCourses || 125, icon: BookOpen, subtitle: "Tổng khóa học nền tảng", color: "bg-info" },
        { title: "Danh mục", value: stats?.totalCategories || 12, icon: FolderTree, subtitle: "Tổng danh mục nền tảng", color: "bg-warning" },
        { title: "Người dùng", value: stats?.totalUsers || 2450, icon: Users, subtitle: "Tổng tài khoản nền tảng", color: "bg-success" },
        { title: "Giảng viên", value: stats?.totalInstructors || 45, icon: UserCheck, subtitle: "Tổng giảng viên đăng ký", color: "bg-primary" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {data.map((item, index) => {
                const Icon = item.icon;
                return (
                    <AppCard key={index} className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                        <AppCardContent className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 text-white rounded-md flex items-center justify-center ${item.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase">{item.title}</p>
                                    <h4 className="text-xl font-bold text-foreground">{item.value.toLocaleString()}</h4>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{item.subtitle}</p>
                        </AppCardContent>
                    </AppCard>
                )
            })}
        </div>
    );
}

function StatsGrid({ stats }) {
    const dynamicStats = [
        {
            title: "Tổng Doanh Thu",
            value: `${(stats?.totalRevenue || 0).toLocaleString()}đ`,
            trend: stats?.revenueTrend ? `+${stats.revenueTrend}%` : "+0%",
            isPositive: true,
            icon: TrendingUp,
            color: "bg-info text-white border-info"
        },
        {
            title: "Tổng Doanh Thu Giảng Viên",
            value: `${(stats?.instructorRevenue || 0).toLocaleString()}đ`,
            trend: stats?.instructorRevenueTrend ? `+${stats.instructorRevenueTrend}%` : "0%",
            isPositive: true,
            icon: BookOpen,
            color: "bg-warning text-white border-warning"
        },
        {
            title: "Người Dùng Mới",
            value: (stats?.newStudents || 0).toLocaleString(),
            trend: stats?.studentTrend ? `+${stats.studentTrend}%` : "+0%",
            isPositive: true,
            icon: Users,
            color: "bg-success text-white border-success"
        },
        {
            title: "Đơn Hàng Mới",
            value: (stats?.todayOrders || 0).toLocaleString(),
            trend: stats?.orderTrend ? `${stats.orderTrend}%` : "0%",
            isPositive: stats?.orderTrend >= 0,
            icon: ShoppingCart,
            color: "bg-primary text-white border-primary"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicStats.map((stat, i) => {
                const Icon = stat.icon;
                const trendValue = stat.trend ? parseFloat(stat.trend.replace(/[^0-9.-]+/g,"")) : 0;
                const progressValue = isNaN(trendValue) ? 0 : Math.min(100, Math.max(5, Math.abs(trendValue) * 4));

                return (
                    <AppCard appVariant="default" key={i} className="bg-card text-card-foreground border-none p-0">
                        <AppCardContent className="p-5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <AppSelect 
                                    value="this-month" 
                                    onValueChange={() => {}}
                                    options={[
                                        { label: "Hôm nay", value: "today" },
                                        { label: "Hôm qua", value: "yesterday" },
                                        { label: "Tháng trước", value: "last-month" },
                                        { label: "Tháng này", value: "this-month" },
                                    ]}
                                    className="!h-8 !py-1 !px-2 bg-transparent border-none shadow-none text-xs font-medium text-muted-foreground hover:bg-muted/50 rounded-md focus:ring-0 w-auto min-w-[100px]"
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                            </div>
                            
                            <div className="mt-1">
                                <div className="flex justify-end mb-1">
                                    <span className="text-xs font-semibold text-foreground">
                                        {Math.round(progressValue)}%
                                    </span>
                                </div>
                                <AppProgress 
                                    value={progressValue} 
                                    heightClass="h-1.5" 
                                    indicatorClassName={stat.isPositive ? "bg-success" : "bg-error"} 
                                    className="bg-muted"
                                />
                                <div className="flex justify-between items-center mt-1.5">
                                    <span className="text-xs font-medium text-muted-foreground">So với tháng trước</span>
                                    <span className={`text-xs font-bold flex items-center gap-0.5 ${stat.isPositive ? 'text-success' : 'text-error'}`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                        </AppCardContent>
                    </AppCard>
                );
            })}
        </div>
    );
}

const topCoursesConfig = {
    students: { label: "Học viên", color: "var(--info)" },
};

function TopCourses({ data }) {
    return (
        <AppCard appVariant="default" className="lg:col-span-2 border-border shadow-sm flex flex-col">
            <AppCardHeader className="pb-2 border-b border-border">
                <AppCardTitle className="text-lg font-bold text-foreground">Top Khóa Học Ghi Danh</AppCardTitle>
                <AppCardDescription>Các khóa học có lượng học viên cao nhất</AppCardDescription>
            </AppCardHeader>
            <AppCardContent className="pt-4 flex-1">
                <ChartContainer config={topCoursesConfig} className="h-[260px] w-full">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 24, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            width={130}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="students" fill="var(--info)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                    </BarChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

const memberGrowthConfig = {
    students: { label: "Học viên", color: "var(--info)" },
    instructors: { label: "Giảng viên", color: "var(--warning)" },
    total: { label: "Tổng số", color: "var(--primary)" }
};

function MemberGrowthChart({ data, stats, className = "" }) {
    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Học viên mới:</span>
            <span className="text-2xl font-semibold text-foreground">{(stats?.newStudents || 0).toLocaleString()}</span>
        </>
    );

    const headerExtra = (
        <ChartDateFilters
            onDateChange={(type, value) => console.log('Date changed:', type, value)}
            onPresetChange={(preset) => console.log('Preset changed:', preset)}
            defaultPreset="6-months"
        />
    );

    // Tự động sinh dữ liệu ảo cho giảng viên và tổng nếu chưa có từ API
    const chartData = data?.map(item => {
        const instructors = item.instructors || Math.floor(item.students * 0.1);
        return {
            ...item,
            instructors,
            total: item.students + instructors
        };
    }) || [];

    return (
        <AppCard appVariant="default" className={`lg:col-span-2 border-border shadow-sm flex flex-col h-[400px] ${className}`}>
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Tăng trưởng Người Dùng</AppCardTitle>
                        <div className="flex items-baseline gap-2">
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {headerExtra}
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                <ChartContainer config={memberGrowthConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        <Bar dataKey="students" name="Học viên" stackId="a" fill="var(--info)" radius={[0, 0, 4, 4]} maxBarSize={40} />
                        <Bar dataKey="instructors" name="Giảng viên" stackId="a" fill="var(--warning)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Line type="monotone" dataKey="total" name="Tổng số" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

function RecentOrders({ orders }) {
    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col">
            <AppCardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                <div>
                    <AppCardTitle className="text-lg font-bold text-foreground">Đơn Hàng Gần Đây</AppCardTitle>
                    <AppCardDescription>Giao dịch thực tế qua hệ thống</AppCardDescription>
                </div>
                <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">
                    Xem tất cả
                </Link>
            </AppCardHeader>
            <AppCardContent className="p-0 flex-1 overflow-auto max-h-[340px]">
                <DataTable
                    columns={[
                        {
                            header: "Mã đơn",
                            cellClassName: "font-medium text-foreground py-3",
                            render: (order) => order.id,
                        },
                        {
                            header: "Khách hàng",
                            cellClassName: "py-3",
                            render: (order) => (
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{order.user}</span>
                                    <span className="text-xs text-muted-foreground mt-0.5">{order.date}</span>
                                </div>
                            ),
                        },
                        {
                            header: "Khóa học",
                            cellClassName: "text-sm text-muted-foreground truncate max-w-[150px] py-3",
                            render: (order) => order.course,
                        },
                        {
                            header: "Giá trị",
                            className: "text-right",
                            cellClassName: "font-bold text-foreground text-right py-3",
                            render: (order) => `${order.price.toLocaleString()}đ`,
                        },
                        {
                            header: "Trạng thái",
                            className: "text-center",
                            cellClassName: "text-center py-3",
                            render: (order) => (
                                <>
                                    {order.status === "completed" && <AppBadge className="bg-success/10 text-success text-success hover:bg-success/10 text-success shadow-none border-success/20">Hoàn thành</AppBadge>}
                                    {order.status === "pending" && <AppBadge className="bg-warning/10 text-warning hover:bg-warning/10 shadow-none border-warning/20">Chờ xử lý</AppBadge>}
                                    {order.status === "failed" && <AppBadge className="bg-error/10 text-error text-error hover:bg-error/10 text-error shadow-none border-error/20">Thất bại</AppBadge>}
                                </>
                            ),
                        },
                    ]}
                    data={orders || []}
                    emptyState="Chưa có đơn hàng nào"
                    disablePagination={true}
                />
            </AppCardContent>
        </AppCard>
    );
}

function TopInstructors() {
    const instructors = [
        { id: 1, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=1", completion: 60, learning: 35, refund: 5 },
        { id: 2, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?u=2", completion: 70, learning: 28, refund: 2 },
        { id: 3, name: "Lê Văn C", avatar: "https://i.pravatar.cc/150?u=3", completion: 55, learning: 40, refund: 5 },
        { id: 4, name: "Phạm Thị D", avatar: "https://i.pravatar.cc/150?u=4", completion: 80, learning: 18, refund: 2 },
        { id: 5, name: "Hoàng Văn E", avatar: "https://i.pravatar.cc/150?u=5", completion: 65, learning: 30, refund: 5 },
    ];

    return (
        <AppCard appVariant="default" className="border-border shadow-sm h-[400px] flex flex-col">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Giảng viên nổi bật</AppCardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <AppSelect 
                            value="this-month" 
                            onValueChange={() => {}}
                            options={[
                                { label: "Tháng trước", value: "last-month" },
                                { label: "Tháng này", value: "this-month" },
                                { label: "Năm nay", value: "this-year" },
                            ]}
                            className="!h-8 !py-1 !px-2 bg-transparent border-none shadow-none text-xs font-medium text-muted-foreground hover:bg-muted/50 rounded-md focus:ring-0 w-auto min-w-[100px]"
                        />
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="px-4 pt-0 pb-4 flex-1">
                <div className="flex flex-col justify-between divide-y divide-border h-full">
                    {instructors.map((inst, idx) => (
                        <div key={idx} className="flex items-center gap-3 py-2 hover:bg-muted/50 transition-colors">
                            <img src={inst.avatar} alt={inst.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate mb-1">{inst.name}</p>
                                <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-muted">
                                    <div className="bg-success" style={{ width: `${inst.completion}%` }} title={`Hoàn thành: ${inst.completion}%`} />
                                    <div className="bg-info" style={{ width: `${inst.learning}%` }} title={`Đang học: ${inst.learning}%`} />
                                    <div className="bg-error" style={{ width: `${inst.refund}%` }} title={`Hoàn trả: ${inst.refund}%`} />
                                </div>
                                <div className="flex justify-between items-center mt-0.5 text-[10px] text-muted-foreground font-medium">
                                    <span className="text-success">{inst.completion}% HT</span>
                                    <span className="text-info">{inst.learning}% ĐH</span>
                                    <span className="text-error">{inst.refund}% Hoàn</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AppCardContent>
        </AppCard>
    );
}

const productivityConfig = {
    completion: { label: "Hoàn thành", color: "var(--success)" },
    learning: { label: "Đang học", color: "var(--info)" },
    refund: { label: "Hoàn tiền", color: "var(--error)" }
};

function StudentProductivityChart() {
    const data = [
        { name: "completion", value: 65, fill: "var(--success)" },
        { name: "learning", value: 30, fill: "var(--info)" },
        { name: "refund", value: 5, fill: "var(--error)" },
    ];

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Năng suất học viên</AppCardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <AppSelect 
                            value="this-month" 
                            onValueChange={() => {}}
                            options={[
                                { label: "Tháng trước", value: "last-month" },
                                { label: "Tháng này", value: "this-month" },
                                { label: "Năm nay", value: "this-year" },
                            ]}
                            className="!h-8 !py-1 !px-2 bg-transparent border-none shadow-none text-xs font-medium text-muted-foreground hover:bg-muted/50 rounded-md focus:ring-0 w-auto min-w-[100px]"
                        />
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="flex-1 pb-6 flex items-center justify-center min-h-0">
                <ChartContainer config={productivityConfig} className="w-full h-[280px] !aspect-auto">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={0}
                            outerRadius={105}
                            cx="50%"
                            cy="50%"
                            strokeWidth={2}
                            stroke="var(--background)"
                            paddingAngle={0}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

const violatingUsersConfig = {
    violations: { label: "Người dùng vi phạm", color: "var(--error)" },
};

function ViolatingUsersChart() {
    const data = [
        { month: "T1", violations: 12 },
        { month: "T2", violations: 19 },
        { month: "T3", violations: 15 },
        { month: "T4", violations: 22 },
        { month: "T5", violations: 14 },
        { month: "T6", violations: 25 },
        { month: "T7", violations: 18 },
    ];

    const totalViolations = data.reduce((sum, item) => sum + item.violations, 0);

    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng vi phạm:</span>
            <span className="text-2xl font-semibold text-foreground">{totalViolations.toLocaleString()}</span>
        </>
    );

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Người dùng vi phạm</AppCardTitle>
                        <div className="flex items-baseline gap-2">
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <ChartDateFilters
                            onDateChange={(type, value) => console.log('Date changed:', type, value)}
                            onPresetChange={(preset) => console.log('Preset changed:', preset)}
                            defaultPreset="6-months"
                        />
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                <ChartContainer config={violatingUsersConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                    <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }}
                            dx={-10}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line 
                            type="monotone" 
                            dataKey="violations" 
                            name="Người dùng vi phạm"
                            stroke="var(--error)" 
                            strokeWidth={3} 
                            dot={{ fill: 'var(--background)', stroke: 'var(--error)', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--error)' }}
                        />
                    </LineChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

function SystemMonitorCharts() {
    const { metricsData } = useSystemMetrics();

    const cpuConfig = {
        cpu: { label: "Sử dụng CPU", color: "var(--primary)" }
    };

    const ramConfig = {
        ram: { label: "Sử dụng RAM", color: "var(--info)" }
    };

    return (
        <div className="space-y-4 pt-8">
            <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary/10 text-primary rounded-full"></span>
                    Hệ thống
                </h2>
                <p className="text-sm text-muted-foreground mt-1 pl-3.5">Giám sát hiệu suất và tài nguyên máy chủ</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[350px]">
                    <AppCardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <AppCardTitle className="text-lg font-semibold">Mức sử dụng CPU</AppCardTitle>
                        </div>
                    </AppCardHeader>
                    <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                        <ChartContainer config={cpuConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                            <AreaChart data={metricsData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(val) => `${val}%`} dx={-10} domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                                <Area type="monotone" dataKey="cpu" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                            </AreaChart>
                        </ChartContainer>
                    </AppCardContent>
                </AppCard>

                <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[350px]">
                    <AppCardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-info" />
                            <AppCardTitle className="text-lg font-semibold">Mức sử dụng RAM</AppCardTitle>
                        </div>
                    </AppCardHeader>
                    <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                        <ChartContainer config={ramConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                            <AreaChart data={metricsData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickFormatter={(val) => `${val}%`} dx={-10} domain={[0, 100]} />
                                <ChartTooltip content={<ChartTooltipContent formatter={(value) => `${value}%`} />} />
                                <Area type="monotone" dataKey="ram" stroke="var(--info)" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} />
                            </AreaChart>
                        </ChartContainer>
                    </AppCardContent>
                </AppCard>
            </div>
        </div>
    );
}

const userAgeConfig = {
    age18_24: { label: "18-24", color: "var(--info)" },
    age25_34: { label: "25-34", color: "var(--primary)" },
    age35_44: { label: "35-44", color: "var(--warning)" },
    age45plus: { label: "45+", color: "var(--success)" }
};

function UserAgeChart() {
    const data = [
        { name: "age18_24", value: 35, fill: "var(--info)" },
        { name: "age25_34", value: 45, fill: "var(--primary)" },
        { name: "age35_44", value: 15, fill: "var(--warning)" },
        { name: "age45plus", value: 5, fill: "var(--success)" },
    ];

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Độ tuổi người dùng</AppCardTitle>
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="flex-1 pb-6 flex items-center justify-center min-h-0">
                <ChartContainer config={userAgeConfig} className="w-full h-[280px] !aspect-auto">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={0}
                            outerRadius={105}
                            cx="50%"
                            cy="50%"
                            strokeWidth={2}
                            stroke="var(--background)"
                            paddingAngle={0}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: '10px' }} />
                    </PieChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

const userRatingsConfig = {
    star5: { label: "5 Sao", color: "var(--success)" },
    star4: { label: "4 Sao", color: "var(--primary)" },
    star3: { label: "3 Sao", color: "var(--info)" },
    star2: { label: "2 Sao", color: "var(--warning)" },
    star1: { label: "1 Sao", color: "var(--error)" },
    total: { label: "Tổng", color: "var(--foreground)" }
};

function UserRatingsChart() {
    const data = [
        { month: "T1", star5: 120, star4: 45, star3: 15, star2: 5, star1: 2, total: 187 },
        { month: "T2", star5: 135, star4: 50, star3: 20, star2: 8, star1: 3, total: 216 },
        { month: "T3", star5: 150, star4: 60, star3: 25, star2: 10, star1: 4, total: 249 },
        { month: "T4", star5: 180, star4: 75, star3: 30, star2: 12, star1: 5, total: 302 },
        { month: "T5", star5: 210, star4: 85, star3: 35, star2: 15, star1: 8, total: 353 },
        { month: "T6", star5: 250, star4: 100, star3: 40, star2: 20, star1: 10, total: 420 },
        { month: "T7", star5: 300, star4: 120, star3: 50, star2: 25, star1: 12, total: 507 },
    ];

    const totalRatings = data.reduce((sum, item) => sum + item.total, 0);

    const subtitle = (
        <>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tổng đánh giá:</span>
            <span className="text-2xl font-semibold text-foreground">{totalRatings.toLocaleString()}</span>
        </>
    );

    return (
        <AppCard appVariant="default" className="border-border shadow-sm flex flex-col h-[400px]">
            <AppCardHeader className="pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <AppCardTitle className="text-lg font-semibold">Đánh giá người dùng</AppCardTitle>
                        <div className="flex items-baseline gap-2">
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <ChartDateFilters
                            onDateChange={(type, value) => console.log('Date changed:', type, value)}
                            onPresetChange={(preset) => console.log('Preset changed:', preset)}
                            defaultPreset="6-months"
                        />
                    </div>
                </div>
            </AppCardHeader>
            <AppCardContent className="w-full pt-0 flex-1 flex flex-col min-h-0">
                <ChartContainer config={userRatingsConfig} className="flex-1 w-full min-h-0 !aspect-auto">
                    <ComposedChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fontWeight: 500, fill: 'var(--muted-foreground)' }} 
                            dx={-10}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        
                        <Bar dataKey="star1" name="1 Sao" stackId="a" fill="var(--error)" maxBarSize={40} />
                        <Bar dataKey="star2" name="2 Sao" stackId="a" fill="var(--warning)" maxBarSize={40} />
                        <Bar dataKey="star3" name="3 Sao" stackId="a" fill="var(--info)" maxBarSize={40} />
                        <Bar dataKey="star4" name="4 Sao" stackId="a" fill="var(--primary)" maxBarSize={40} />
                        <Bar dataKey="star5" name="5 Sao" stackId="a" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        
                        <Line type="monotone" dataKey="total" name="Tổng" stroke="var(--foreground)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}
