import React from "react";
import { AppButton } from "@/components/common/micro/AppButton";
import AppSelect from "@/components/common/micro/AppSelect";
import AppInput from "@/components/common/micro/AppInput";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useDashboard } from "@/hooks/dashboard/useDashboard";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle } from "@/components/common/micro/AppCard";
import AppBadge from "@/components/common/micro/AppBadge";

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
          <AppSelect className="h-9 px-3 py-1 bg-transparent text-sm font-medium focus:outline-none border-none cursor-pointer">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Năm nay</option>
          </AppSelect>
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


const revenueConfig = {
    revenue: { label: "Doanh thu (đ)", color: "hsl(221, 83%, 53%)" },
    orders: { label: "Đơn hàng", color: "hsl(142, 71%, 45%)" },
};

function RevenueCharts({ revenueData }) {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6 pb-2">
            <AppCard appVariant="default" className="border-border shadow-sm flex flex-col">
                <AppCardHeader className="pb-2 border-b border-border">
                    <AppCardTitle className="text-lg font-bold text-foreground">Doanh Thu & Đơn Hàng</AppCardTitle>
                    <CardDescription>Biến động doanh thu theo từng tháng trong năm</CardDescription>
                </AppCardHeader>
                <AppCardContent className="pt-4 flex-1">
                    <ChartContainer config={revenueConfig} className="h-[300px] w-full">
                        <AreaChart data={revenueData} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#revGradient)" dot={false} />
                            <Area yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#orderGradient)" dot={false} />
                        </AreaChart>
                    </ChartContainer>
                </AppCardContent>
            </AppCard>
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
            color: "text-info bg-blue-50 border-info/20"
        },
        {
            title: "Học Viên Mới",
            value: (stats?.newStudents || 0).toLocaleString(),
            trend: stats?.studentTrend ? `+${stats.studentTrend}%` : "+0%",
            isPositive: true,
            icon: Users,
            color: "text-success bg-green-50 border-success/20"
        },
        {
            title: "Khóa Học Đang Bán",
            value: (stats?.activeCourses || 0).toLocaleString(),
            trend: stats?.courseTrend ? `+${stats.courseTrend}%` : "0%",
            isPositive: true,
            icon: BookOpen,
            color: "text-warning bg-orange-50 border-warning/20"
        },
        {
            title: "Đơn Hàng Hôm Nay",
            value: (stats?.todayOrders || 0).toLocaleString(),
            trend: stats?.orderTrend ? `${stats.orderTrend}%` : "0%",
            isPositive: stats?.orderTrend >= 0,
            icon: ShoppingCart,
            color: "text-purple-600 bg-purple-50 border-purple-100"
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <AppCard appVariant="default" key={i} className="border-border shadow-sm hover:shadow-md transition-all duration-300">
                        <AppCardContent className="p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.isPositive ? 'text-success bg-green-50/80 border border-success/20' : 'text-error bg-red-50/80 border border-error/20'}`}>
                                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1.5">{stat.title}</h3>
                                <div className="text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
                            </div>
                        </AppCardContent>
                    </AppCard>
                );
            })}
        </div>
    );
}

const topCoursesConfig = {
    students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
};

function TopCourses({ data }) {
    return (
        <AppCard appVariant="default" className="lg:col-span-2 border-border shadow-sm flex flex-col">
            <AppCardHeader className="pb-2 border-b border-border">
                <AppCardTitle className="text-lg font-bold text-foreground">Top Khóa Học Ghi Danh</AppCardTitle>
                <CardDescription>Các khóa học có lượng học viên cao nhất</CardDescription>
            </AppCardHeader>
            <AppCardContent className="pt-4 flex-1">
                <ChartContainer config={topCoursesConfig} className="h-[260px] w-full">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 0, right: 24, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
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
                        <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                    </BarChart>
                </ChartContainer>
            </AppCardContent>
        </AppCard>
    );
}

const userGrowthConfig = {
    students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
    instructors: { label: "Giảng viên", color: "hsl(38, 92%, 50%)" },
};

function MemberGrowthChart({ data }) {
    return (
        <AppCard appVariant="default" className="lg:col-span-2 border-border shadow-sm flex flex-col">
            <AppCardHeader className="pb-2 border-b border-border">
                <AppCardTitle className="text-lg font-bold text-foreground">Tăng Trưởng Thành Viên</AppCardTitle>
                <CardDescription>Lượng đăng ký mới của Học viên và Giảng viên theo tháng</CardDescription>
            </AppCardHeader>
            <AppCardContent className="pt-4 flex-1">
                <ChartContainer config={userGrowthConfig} className="h-[240px] w-full">
                    <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="instructors" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
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
                    <CardDescription>Giao dịch thực tế qua hệ thống</CardDescription>
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
                                    {order.status === "pending" && <AppBadge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-amber-200">Chờ xử lý</AppBadge>}
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