import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Plus,
  Star,
  Activity,
  DollarSign,
  TrendingDown,
  Calendar as CalendarIcon,
  ChevronDown
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Mock Data for Charts
const REVENUE_DATA = [
  { month: "T10", revenue: 12000000 },
  { month: "T11", revenue: 18500000 },
  { month: "T12", revenue: 15400000 },
  { month: "T01", revenue: 22800000 },
  { month: "T02", revenue: 19600000 },
  { month: "T03", revenue: 24500000 },
];

const STUDENT_GROWTH_DATA = [
  { month: "T10", students: 450 },
  { month: "T11", students: 620 },
  { month: "T12", students: 580 },
  { month: "T01", students: 890 },
  { month: "T02", students: 740 },
  { month: "T03", students: 1050 },
];

const RATING_DISTRIBUTION = [
  { name: "5 Sao", value: 750, color: "#10b981" },
  { name: "4 Sao", value: 180, color: "#3b82f6" },
  { name: "3 Sao", value: 50, color: "#f59e0b" },
  { name: "2 Sao", value: 15, color: "#ef4444" },
  { name: "1 Sao", value: 5, color: "#6b7280" },
];

const STATS = [
  {
    title: "Doanh Thu Tháng",
    value: "24.500.000đ",
    trend: "+15.3%",
    isPositive: true,
    icon: DollarSign,
    color: "text-emerald-600 bg-emerald-50 border-emerald-100"
  },
  {
    title: "Học Viên Mới",
    value: "1,050",
    trend: "+12.4%",
    isPositive: true,
    icon: Users,
    color: "text-blue-600 bg-blue-50 border-blue-100"
  },
  {
    title: "Điểm Đánh Giá",
    value: "4.8",
    trend: "+0.1",
    isPositive: true,
    icon: Star,
    color: "text-amber-600 bg-amber-50 border-amber-100"
  },
  {
    title: "Tỷ Lệ Hoàn Thành",
    value: "78%",
    trend: "-1.2%",
    isPositive: false,
    icon: Activity,
    color: "text-indigo-600 bg-indigo-50 border-indigo-100"
  },
];


export default function InstructorDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng Quan Giảng Viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi hiệu suất và tăng trưởng của các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-200">Xuất báo cáo</Button>
          <Link to="/instructor/courses/courses-form">
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-none font-bold">
              Tạo Khóa Học Mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-slate-200 shadow-sm border-b-4 border-b-green-500/10 hover:border-b-green-500/50 transition-all">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${stat.isPositive ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.trend}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</h3>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Thống kê Doanh thu</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tổng doanh thu:</span>
                  <span className="text-2xl font-bold text-slate-900">112.800.000đ</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Selector */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                  <div className="relative">
                    <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      type="date"
                      className="h-8 w-[130px] pl-8 pr-2 border-none bg-transparent text-xs font-bold focus-visible:ring-0 shadow-none"
                      placeholder="Từ ngày"
                    />
                  </div>
                  <div className="w-2 h-[1px] bg-slate-300"></div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      type="date"
                      className="h-8 w-[130px] pl-8 pr-2 border-none bg-transparent text-xs font-bold focus-visible:ring-0 shadow-none"
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>

                {/* Presets Selector */}
                <Select defaultValue="6-months">
                  <SelectTrigger className="h-10 w-[160px] bg-white border-slate-200 text-xs font-bold rounded-lg shadow-none">
                    <SelectValue placeholder="Chọn khoảng thời gian" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="yesterday" className="text-xs font-bold">Hôm qua</SelectItem>
                    <SelectItem value="last-7-days" className="text-xs font-bold">7 ngày qua</SelectItem>
                    <SelectItem value="last-30-days" className="text-xs font-bold">30 ngày qua</SelectItem>
                    <SelectItem value="this-month" className="text-xs font-bold">Tháng này</SelectItem>
                    <SelectItem value="last-month" className="text-xs font-bold">Tháng trước</SelectItem>
                    <SelectItem value="this-quarter" className="text-xs font-bold">Quý này</SelectItem>
                    <SelectItem value="6-months" className="text-xs font-bold">6 tháng qua</SelectItem>
                    <SelectItem value="this-year" className="text-xs font-bold">Năm nay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                  tickFormatter={(value) => `${value / 1000000}Tr`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value.toLocaleString()}đ`, "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution (Pie/Bar) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Phân Bổ Đánh Giá</CardTitle>
            <CardDescription>Dựa trên 1,000+ đánh giá mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-0 flex flex-col">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={RATING_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {RATING_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
              {RATING_DISTRIBUTION.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

