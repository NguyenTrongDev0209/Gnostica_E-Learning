import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Server,
  ActivitySquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

// ─── Data: Stats & Orders ──────────────────────────────────────────────

const RECENT_ORDERS = [
  { id: "#ORD-001", user: "Nguyễn Văn A", course: "Fullstack Next.js", price: "899.000đ", status: "completed", date: "Vừa xong" },
  { id: "#ORD-002", user: "Trần Thị B", course: "React Query Master", price: "499.000đ", status: "pending", date: "5 phút trước" },
  { id: "#ORD-003", user: "Lê Văn C", course: "Docker Bootcamp", price: "749.000đ", status: "completed", date: "12 phút trước" },
  { id: "#ORD-004", user: "Phạm D", course: "UI/UX Design UI", price: "1.299.000đ", status: "failed", date: "1 giờ trước" },
  { id: "#ORD-005", user: "Hoàng E", course: "NodeJS Backend", price: "599.000đ", status: "completed", date: "2 giờ trước" },
];

const REVENUE_DATA = [
  { month: "T1", revenue: 42000000, orders: 210 },
  { month: "T2", revenue: 58000000, orders: 290 },
  { month: "T3", revenue: 53000000, orders: 265 },
  { month: "T4", revenue: 71000000, orders: 355 },
  { month: "T5", revenue: 68000000, orders: 340 },
  { month: "T6", revenue: 95000000, orders: 475 },
  { month: "T7", revenue: 88000000, orders: 440 },
  { month: "T8", revenue: 110000000, orders: 550 },
  { month: "T9", revenue: 102000000, orders: 510 },
  { month: "T10", revenue: 115000000, orders: 575 },
  { month: "T11", revenue: 121000000, orders: 605 },
  { month: "T12", revenue: 128500000, orders: 642 },
];

const REVENUE_BY_CATEGORY_DATA = [
  { month: "Q1/26", web: 150000000, mobile: 80000000, data: 50000000 },
  { month: "Q2/26", web: 180000000, mobile: 90000000, data: 65000000 },
  { month: "Q3/26", web: 165000000, mobile: 110000000, data: 80000000 },
  { month: "Q4/26", web: 210000000, mobile: 130000000, data: 95000000 },
];

const USER_GROWTH_DATA = [
  { month: "T1", students: 320, instructors: 8 },
  { month: "T2", students: 480, instructors: 12 },
  { month: "T3", students: 410, instructors: 9 },
  { month: "T4", students: 620, instructors: 15 },
  { month: "T5", students: 710, instructors: 18 },
  { month: "T6", students: 890, instructors: 22 },
  { month: "T7", students: 820, instructors: 20 },
  { month: "T8", students: 1050, instructors: 26 },
  { month: "T9", students: 980, instructors: 24 },
  { month: "T10", students: 1120, instructors: 28 },
  { month: "T11", students: 1180, instructors: 30 },
  { month: "T12", students: 1245, instructors: 32 },
];

const USER_AGE_DATA = [
  { name: "18 - 24 tuổi", value: 35, fill: "hsl(221, 83%, 53%)" },
  { name: "25 - 34 tuổi", value: 28, fill: "hsl(142, 71%, 45%)" },
  { name: "35 - 44 tuổi", value: 18, fill: "hsl(38, 92%, 50%)" },
  { name: "45+ tuổi", value: 12, fill: "hsl(271, 81%, 56%)" },
  { name: "Dưới 18 tuổi", value: 7, fill: "hsl(0, 84%, 60%)" },
];

const TRAFFIC_SOURCE_DATA = [
  { name: "Tìm kiếm (Google)", value: 45, fill: "hsl(221, 83%, 53%)" },
  { name: "Quảng cáo (Ads)", value: 30, fill: "hsl(142, 71%, 45%)" },
  { name: "Giới thiệu (Referral)", value: 15, fill: "hsl(38, 92%, 50%)" },
  { name: "Trực tiếp (Direct)", value: 10, fill: "hsl(271, 81%, 56%)" },
];

const ENGAGEMENT_DATA = [
  { week: "Tuần 1", videoViews: 4500, assignments: 1200 },
  { week: "Tuần 2", videoViews: 5200, assignments: 1350 },
  { week: "Tuần 3", videoViews: 4800, assignments: 1100 },
  { week: "Tuần 4", videoViews: 6100, assignments: 1550 },
];

const RADAR_RATING_DATA = [
  { subject: "Giảng viên", A: 4.8, fullMark: 5 },
  { subject: "Nội dung", A: 4.5, fullMark: 5 },
  { subject: "Bài tập", A: 4.2, fullMark: 5 },
  { subject: "Hỗ trợ", A: 3.9, fullMark: 5 },
  { subject: "Video/Âm thanh", A: 4.6, fullMark: 5 },
];

const TOP_COURSES_DATA = [
  { name: "Fullstack Next.js", students: 1245, rating: 4.9 },
  { name: "React Query Master", students: 987, rating: 4.8 },
  { name: "NodeJS Backend", students: 832, rating: 4.7 },
  { name: "Docker Bootcamp", students: 654, rating: 4.6 },
  { name: "UI/UX Figma", students: 521, rating: 4.5 },
];

const COMPLETION_DATA = [
  { name: "Hoàn thành", value: 68, fill: "hsl(142, 71%, 45%)" },
  { name: "Đang học", value: 24, fill: "hsl(221, 83%, 53%)" },
  { name: "Bỏ dở", value: 8, fill: "hsl(0, 84%, 60%)" },
];

const CCU_DATA = [
  { time: "00:00", active: 240 },
  { time: "04:00", active: 120 },
  { time: "08:00", active: 850 },
  { time: "12:00", active: 1100 },
  { time: "16:00", active: 950 },
  { time: "20:00", active: 2150 },
  { time: "23:59", active: 1540 },
];

const SYSTEM_RESOURCE_DATA = [
  { time: "00:00", cpu: 15, ram: 40 },
  { time: "04:00", cpu: 10, ram: 35 },
  { time: "08:00", cpu: 45, ram: 55 },
  { time: "12:00", cpu: 65, ram: 70 },
  { time: "16:00", cpu: 55, ram: 65 },
  { time: "20:00", cpu: 85, ram: 85 },
  { time: "23:59", cpu: 70, ram: 75 },
];

const API_STATUS_DATA = [
  { date: "T2", ok: 45000, error: 120 },
  { date: "T3", ok: 48000, error: 95 },
  { date: "T4", ok: 52000, error: 210 },
  { date: "T5", ok: 49000, error: 150 },
  { date: "T6", ok: 55000, error: 180 },
  { date: "T7", ok: 61000, error: 320 },
  { date: "CN", ok: 58000, error: 240 },
];

const revenueConfig = {
  revenue: { label: "Doanh thu (đ)", color: "hsl(221, 83%, 53%)" },
  orders: { label: "Đơn hàng", color: "hsl(142, 71%, 45%)" },
};

const revenueCategoryConfig = {
  web: { label: "Web Dev (đ)", color: "hsl(221, 83%, 53%)" },
  mobile: { label: "Mobile App (đ)", color: "hsl(142, 71%, 45%)" },
  data: { label: "Data Science (đ)", color: "hsl(38, 92%, 50%)" },
};

const userGrowthConfig = {
  students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
  instructors: { label: "Giảng viên", color: "hsl(38, 92%, 50%)" },
};

const engagementConfig = {
  videoViews: { label: "Lượt xem video", color: "hsl(221, 83%, 53%)" },
  assignments: { label: "Lượt nộp bài", color: "hsl(142, 71%, 45%)" },
};

const topCoursesConfig = {
  students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
};

const radarRatingConfig = {
  A: { label: "Điểm TB", color: "hsl(38, 92%, 50%)" },
};

const apiConfig = {
  ok: { label: "API Thành Công (2xx)", color: "hsl(142, 71%, 45%)" },
  error: { label: "API Thất Bại (4xx/5xx)", color: "hsl(0, 84%, 60%)" },
};

const resourceConfig = {
  cpu: { label: "CPU Usage (%)", color: "hsl(221, 83%, 53%)" },
  ram: { label: "RAM Usage (%)", color: "hsl(38, 92%, 50%)" },
};

const ccuConfig = {
  active: { label: "Concurrent Users (CCU)", color: "hsl(271, 81%, 56%)" },
};

import { useDashboard } from "@/hooks/admin/useDashboard";

export default function AdminDashboard() {
  const { stats, memberGrowth, isLoading } = useDashboard();

  const dynamicStats = [
    {
      title: "Tổng Doanh Thu",
      value: `${(stats?.totalRevenue || 0).toLocaleString()}đ`,
      trend: "+12.5%",
      isPositive: true,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      title: "Học Viên Mới",
      value: (stats?.newStudents || 0).toLocaleString(),
      trend: "+18.2%",
      isPositive: true,
      icon: Users,
      color: "text-green-600 bg-green-50 border-green-100"
    },
    {
      title: "Khóa Học Đang Bán",
      value: (stats?.activeCourses || 0).toLocaleString(),
      trend: "0%",
      isPositive: true,
      icon: BookOpen,
      color: "text-orange-600 bg-orange-50 border-orange-100"
    },
    {
      title: "Đơn Hàng Hôm Nay",
      value: (stats?.todayOrders || 0).toLocaleString(),
      trend: "-4.1%",
      isPositive: false,
      icon: ShoppingCart,
      color: "text-purple-600 bg-purple-50 border-purple-100"
    },
  ];

  const chartData = memberGrowth.length > 0 ? memberGrowth : USER_GROWTH_DATA;
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trung Tâm Quản Trị</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tổng quan hoạt động kinh doanh và hạ tầng của nền tảng E-Learning.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <select className="h-9 px-3 py-1 bg-transparent text-sm font-medium focus:outline-none border-none cursor-pointer">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${stat.isPositive ? 'text-green-700 bg-green-50/80 border border-green-100' : 'text-red-700 bg-red-50/80 border border-red-100'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1.5">{stat.title}</h3>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── SECTION 1: Tài chính & Kinh doanh ─── */}
      <div className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Tài chính & Kinh doanh
          </h2>
          <p className="text-sm text-slate-500 mt-1 pl-3.5">Tổng quan doanh thu và tình hình đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-2">
          {/* Revenue Area Chart */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Doanh Thu Theo Tháng</CardTitle>
              <CardDescription>Tổng doanh thu và số đơn hàng trong năm</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={revenueConfig} className="h-[280px] w-full">
                <AreaChart data={REVENUE_DATA} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
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
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Đơn Hàng Gần Đây</CardTitle>
                <CardDescription>Giao dịch qua cổng thanh toán</CardDescription>
              </div>
              <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">
                Xem tất cả
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto max-h-[340px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="py-3 font-semibold text-slate-700">Mã đơn</TableHead>
                    <TableHead className="py-3 font-semibold text-slate-700">Khách hàng</TableHead>
                    <TableHead className="py-3 font-semibold text-slate-700">Khóa học</TableHead>
                    <TableHead className="py-3 font-semibold text-slate-700 text-right">Giá trị</TableHead>
                    <TableHead className="py-3 font-semibold text-slate-700 text-center">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RECENT_ORDERS.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/50 border-b border-slate-100 last:border-none">
                      <TableCell className="font-medium text-slate-900 py-3">{order.id}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{order.user}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{order.date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 truncate max-w-[150px] py-3">
                        {order.course}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-right py-3">{order.price}</TableCell>
                      <TableCell className="text-center py-3">
                        {order.status === "completed" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shadow-none border-green-200">Hoàn thành</Badge>}
                        {order.status === "pending" && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 shadow-none border-amber-200">Chờ xử lý</Badge>}
                        {order.status === "failed" && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-red-200">Thất bại</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Stacked Bar Chart - Revenue By Category */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Doanh Thu Từng Doanh Mục Cốt Lõi</CardTitle>
              <CardDescription>Sự đóng góp của từng ngách học quan trọng (VND)</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={revenueCategoryConfig} className="h-[300px] w-full">
                <BarChart data={REVENUE_BY_CATEGORY_DATA} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="web" stackId="a" fill="hsl(221, 83%, 53%)" radius={[0, 0, 4, 4]} maxBarSize={56} />
                  <Bar dataKey="mobile" stackId="a" fill="hsl(142, 71%, 45%)" maxBarSize={56} />
                  <Bar dataKey="data" stackId="a" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── SECTION 2: Phân tích Người dùng ─── */}
      <div className="space-y-4 pt-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
            Phân tích Thành viên
          </h2>
          <p className="text-sm text-slate-500 mt-1 pl-3.5">Hành vi, nguồn truy cập và độ tuổi của tập người dùng</p>
        </div>

        {/* Row 1: User Growth + Traffic Source */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
          {/* User Growth Bar Chart */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Tăng Trưởng Thành Viên Mới</CardTitle>
              <CardDescription>Lượng đăng ký mới của Học viên và Giảng viên theo tháng</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={userGrowthConfig} className="h-[240px] w-full">
                <BarChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="instructors" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Traffic Source Donut Chart */}
          <Card className="border-slate-200 shadow-sm flex flex-col lg:col-span-1">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Nguồn Lưu Lượng</CardTitle>
              <CardDescription>Khách hàng biết đến từ đâu?</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-1 flex-col items-center justify-center">
              <ChartContainer config={{}} className="h-[200px] w-full">
                <PieChart>
                  <Pie
                    data={TRAFFIC_SOURCE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {TRAFFIC_SOURCE_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                            <p className="font-bold text-slate-900">{payload[0].name}</p>
                            <p className="text-slate-500">{payload[0].value}% tổng lượng</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
              <div className="w-full space-y-2 mt-2 px-2">
                {TRAFFIC_SOURCE_DATA.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Engagement Line + User Age Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Engagement Line Chart */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Nhịp Độ Tương Tác</CardTitle>
              <CardDescription>Biến động lượt học video và nộp bài tập hàng tuần</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={engagementConfig} className="h-[240px] w-full">
                <LineChart data={ENGAGEMENT_DATA} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="videoViews" stroke="hsl(221, 83%, 53%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="assignments" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* User Age Pie Chart */}
          <Card className="border-slate-200 shadow-sm flex flex-col lg:col-span-1">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Phân Tán Độ Tuổi</CardTitle>
              <CardDescription>Nhóm tuổi của thành viên nền tảng</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-1 flex-col items-center justify-center">
              <ChartContainer config={{}} className="h-[200px] w-full">
                <PieChart>
                  <Pie
                    data={USER_AGE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {USER_AGE_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                            <p className="font-bold text-slate-900">{payload[0].name}</p>
                            <p className="text-slate-500">{payload[0].value}% hệ thống</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
              <div className="w-full space-y-2 mt-2 px-2">
                {USER_AGE_DATA.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── SECTION 3: Hoạt động Khóa học & Đánh giá ─── */}
      <div className="space-y-4 pt-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Hoạt động Khóa học & Đánh giá
          </h2>
          <p className="text-sm text-slate-500 mt-1 pl-3.5">Chất lượng giảng dạy, tỷ lệ khóa học hoàn tất</p>
        </div>

        {/* Row 1: Top Courses + Radar Rating */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
          {/* Top Courses Horizontal Bar */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Top Khóa Học Ghi Danh</CardTitle>
              <CardDescription>Các khóa học có lượng mua và quan tâm cao nhất</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={topCoursesConfig} className="h-[260px] w-full">
                <BarChart
                  data={TOP_COURSES_DATA}
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
            </CardContent>
          </Card>

          {/* Radar Rating Chart */}
          <Card className="border-slate-200 shadow-sm flex flex-col lg:col-span-1">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Chất Lượng Toàn Diện</CardTitle>
              <CardDescription>Mạng nhện đánh giá trên thang 5 điểm</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-1 flex-col items-center justify-center">
              <ChartContainer config={radarRatingConfig} className="h-[240px] w-full">
                <RadarChart data={RADAR_RATING_DATA} outerRadius={75}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Radar name="A" dataKey="A" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="hsl(38, 92%, 50%)" fillOpacity={0.35} />
                  <ChartTooltip 
                     content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                            <p className="font-bold text-slate-900 mb-1">{payload[0].payload.subject}</p>
                            <p className="text-amber-600 font-bold text-sm">{payload[0].value} / 5.0</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Course Completion Radial (Full Width centered) */}
        <div className="grid grid-cols-1 gap-6">
          {/* Course Completion Radial */}
          <Card className="border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Trạng Thái Tương Tác Của Học Viên</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-6 flex-1 flex flex-col md:flex-row items-center justify-center gap-12">
              <ChartContainer config={{}} className="h-[220px] w-[220px] shrink-0">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  data={COMPLETION_DATA}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" background={{ fill: "#f1f5f9" }} cornerRadius={4}>
                    {COMPLETION_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </RadialBar>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                            <p className="font-bold">{payload[0].payload.name}</p>
                            <p className="text-slate-500">{payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadialBarChart>
              </ChartContainer>
              
              <div className="space-y-4 flex flex-col justify-center min-w-[200px]">
                {COMPLETION_DATA.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-slate-700 font-medium">{item.name}</span>
                    </div>
                    <span className="font-black text-slate-900 text-base">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── SECTION 4: Giám Sát Cơ Sở Hạ Tầng (IT Ops) ─── */}
      <div className="space-y-4 pt-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span>
            Giám Sát Cơ Sở Hạ Tầng
          </h2>
          <p className="text-sm text-slate-500 mt-1 pl-3.5">Quản lý sức khỏe máy chủ, API và lượng truy cập thực tế</p>
        </div>

        {/* Row 1: Resource Area + System Status Text Block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
          {/* Resource Usage Area Chart */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Tài Nguyên Máy Chủ (Server Metrics)</CardTitle>
                <CardDescription>Tiêu thụ CPU và Bộ nhớ (RAM) 24h qua</CardDescription>
              </div>
              <Server className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={resourceConfig} className="h-[240px] w-full">
                <AreaChart data={SYSTEM_RESOURCE_DATA} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="ram" stroke="hsl(38, 92%, 50%)" strokeWidth={2} fill="url(#ramGradient)" />
                  <Area type="monotone" dataKey="cpu" stroke="hsl(221, 83%, 53%)" strokeWidth={2} fill="url(#cpuGradient)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          {/* System Status Text Block (Moved from Section 3) */}
          <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Chi Tiết Hạ Tầng</CardTitle>
              <Activity className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col gap-6">
              <div className="space-y-5">
                {[
                  { label: "CPU Usage Hiện Tại", value: 42, color: "bg-blue-500" },
                  { label: "RAM Usage Hiện Tại", value: 68, color: "bg-amber-500" },
                  { label: "Băng Thông Dùng", value: 55, color: "bg-indigo-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Node Cluster OK</p>
                    <p className="text-xs text-slate-500 mt-0.5">Uptime: 45d 12h 30m</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: API Status + CCU */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Status Stacked Bar */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Trạng Thái API</CardTitle>
                <CardDescription>Số lượng Queries Success vs Lỗi Server rớt gói (QPS)</CardDescription>
              </div>
              <ActivitySquare className="w-5 h-5 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={apiConfig} className="h-[240px] w-full">
                <BarChart data={API_STATUS_DATA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="error" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 0, 4, 4]} maxBarSize={40} />
                  <Bar dataKey="ok" stackId="a" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* CCU Line Chart */}
          <Card className="lg:col-span-1 border-slate-200 shadow-sm flex flex-col">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Lượng CCU 24 Giờ Qua</CardTitle>
              <CardDescription>Học viên & khách truy cập đồng thời</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
              <ChartContainer config={ccuConfig} className="h-[240px] w-full">
                <LineChart data={CCU_DATA} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="stepAfter" dataKey="active" stroke="hsl(271, 81%, 56%)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
