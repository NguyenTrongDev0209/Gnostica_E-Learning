import React from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity
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
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  { 
    title: "Tổng Doanh Thu", 
    value: "128.500.000đ", 
    trend: "+12.5%", 
    isPositive: true,
    icon: TrendingUp,
    color: "text-blue-600 bg-blue-50 border-blue-100"
  },
  { 
    title: "Học Viên Mới", 
    value: "1,245", 
    trend: "+18.2%", 
    isPositive: true,
    icon: Users,
    color: "text-green-600 bg-green-50 border-green-100"
  },
  { 
    title: "Khóa Học Đang Bán", 
    value: "42", 
    trend: "0%", 
    isPositive: true,
    icon: BookOpen,
    color: "text-orange-600 bg-orange-50 border-orange-100"
  },
  { 
    title: "Đơn Hàng Hôm Nay", 
    value: "38", 
    trend: "-4.1%", 
    isPositive: false,
    icon: ShoppingCart,
    color: "text-purple-600 bg-purple-50 border-purple-100"
  },
];

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

const CATEGORY_DATA = [
  { name: "Web Development", value: 38, fill: "hsl(221, 83%, 53%)" },
  { name: "Mobile App", value: 22, fill: "hsl(142, 71%, 45%)" },
  { name: "UI/UX Design", value: 18, fill: "hsl(38, 92%, 50%)" },
  { name: "Data Science", value: 14, fill: "hsl(271, 81%, 56%)" },
  { name: "DevOps", value: 8, fill: "hsl(0, 84%, 60%)" },
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

// ─── Chart Configs ────────────────────────────────────────────────────────────

const revenueConfig = {
  revenue: { label: "Doanh thu (đ)", color: "hsl(221, 83%, 53%)" },
  orders: { label: "Đơn hàng", color: "hsl(142, 71%, 45%)" },
};

const userGrowthConfig = {
  students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
  instructors: { label: "Giảng viên", color: "hsl(38, 92%, 50%)" },
};

const topCoursesConfig = {
  students: { label: "Học viên", color: "hsl(221, 83%, 53%)" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng Quan Hệ Thống</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật tình hình hoạt động của nền tảng học trực tuyến.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">{stat.title}</h3>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Row 2: Revenue Area Chart + Pie Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Doanh Thu Theo Tháng</CardTitle>
            <CardDescription>Tổng doanh thu và số đơn hàng trong năm 2026</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={revenueConfig} className="h-[260px] w-full">
              <AreaChart data={REVENUE_DATA} margin={{ left: 8, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
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

        {/* Category Pie Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Danh Mục Khóa Học</CardTitle>
            <CardDescription>Phân bổ theo chủ đề</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center">
            <ChartContainer config={{}} className="h-[200px] w-full">
              <PieChart>
                <Pie
                  data={CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
                          <p className="font-bold text-slate-900">{payload[0].name}</p>
                          <p className="text-slate-500">{payload[0].value}% khóa học</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
            <div className="w-full space-y-2 mt-2">
              {CATEGORY_DATA.map((item, i) => (
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

      {/* Row 3: User Growth Bar + Top Courses Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* User Growth Bar Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Tăng Trưởng Người Dùng</CardTitle>
            <CardDescription>Học viên và giảng viên mới theo tháng</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={userGrowthConfig} className="h-[240px] w-full">
              <BarChart data={USER_GROWTH_DATA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="instructors" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Courses Horizontal Bar */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Top Khóa Học</CardTitle>
            <CardDescription>Khóa học có nhiều học viên nhất</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ChartContainer config={topCoursesConfig} className="h-[240px] w-full">
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
                  width={110}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="hsl(221, 83%, 53%)" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Orders + Completion Radial + System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Đơn Hàng Gần Đây</CardTitle>
            <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="py-3 font-semibold text-slate-700">Mã đơn</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700">Người mua</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700">Khóa học</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700">Giá trị</TableHead>
                  <TableHead className="py-3 font-semibold text-slate-700">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_ORDERS.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{order.user}</span>
                        <span className="text-xs text-slate-500">{order.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 truncate max-w-[150px]">
                      {order.course}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">{order.price}</TableCell>
                    <TableCell>
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

        {/* Right column: Completion Radial + System Status */}
        <div className="flex flex-col gap-6">

          {/* Course Completion Radial */}
          <Card className="border-slate-200 shadow-sm flex-1">
            <CardHeader className="pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Tỉ Lệ Hoàn Thành</CardTitle>
              <CardDescription>Tiến độ học viên</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex flex-col items-center">
              <ChartContainer config={{}} className="h-[140px] w-full">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={65}
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
              <div className="w-full space-y-1.5 mt-1">
                {COMPLETION_DATA.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Trạng Thái Hệ Thống</CardTitle>
              <Activity className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { label: "CPU Usage", value: 42, color: "bg-blue-500" },
                  { label: "Memory (RAM)", value: 68, color: "bg-amber-500" },
                  { label: "Storage", value: 89, color: "bg-red-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className="font-bold text-slate-900">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Hệ thống đang hoạt động</p>
                  <p className="text-xs text-slate-500">Uptime: 45 ngày 12 giờ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
