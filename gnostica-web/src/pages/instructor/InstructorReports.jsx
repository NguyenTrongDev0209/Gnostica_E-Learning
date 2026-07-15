import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Download, 
  Calendar,
  ChevronRight,
  Target,
  Clock,
  Layout
} from "lucide-react";
import AppCard, { AppCardContent, AppCardHeader, AppCardTitle, AppCardDescription } from "@/components/common/micro/AppCard";
import { AppButton } from "@/components/common/micro/AppButton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts";

const COMPLETION_DATA = [
  { name: "Khóa A", rate: 85 },
  { name: "Khóa B", rate: 62 },
  { name: "Khóa C", rate: 45 },
  { name: "Khóa D", rate: 92 },
  { name: "Khóa E", rate: 78 },
];

const ENGAGEMENT_DATA = [
  { day: "Thứ 2", active: 120 },
  { day: "Thứ 3", active: 210 },
  { day: "Thứ 4", active: 180 },
  { day: "Thứ 5", active: 300 },
  { day: "Thứ 6", active: 250 },
  { day: "Thứ 7", active: 420 },
  { day: "Chủ nhật", active: 380 },
];

const DEVICE_DATA = [
  { name: "Desktop", value: 65, color: "#3b82f6" },
  { name: "Mobile", value: 30, color: "#10b981" },
  { name: "Tablet", value: 5, color: "#f59e0b" },
];

export default function InstructorReports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Báo Cáo & Phân Tích</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem dữ liệu chi tiết về hiệu suất khóa học và sự tương tác của học viên.
          </p>
        </div>
        <div className="flex gap-2">
          <AppButton appVariant="ghostMuted" variant="ghost" className="border border-border">
            <Calendar className="w-4 h-4 mr-2" /> 30 ngày qua
          </AppButton>
          <AppButton appVariant="gradient" className="bg-success/10 text-success hover:bg-success/20 font-bold">
            <Download className="w-4 h-4 mr-2" /> Tải báo cáo PDF
          </AppButton>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Tỷ lệ hoàn thành", value: "72.4%", icon: Target, isPositive: true, trend: "+2.1%", styles: "text-info bg-blue-50 border-info/20" },
          { label: "Thời gian học TB", value: "45p/ngày", icon: Clock, isPositive: true, trend: "+5.4%", styles: "text-success bg-green-50 border-success/20" },
          { label: "Điểm thi trung bình", value: "8.2/10", icon: Award, isPositive: false, trend: "-0.5%", styles: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Số giờ giảng dạy", value: "124h", icon: Layout, isPositive: true, trend: "+12h", styles: "text-indigo-600 bg-indigo-50 border-indigo-100" },
        ].map((kpi, i) => (
          <AppCard key={i} className="border-border shadow-sm overflow-hidden">
            <AppCardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className={`p-2 rounded-lg border ${kpi.styles}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${kpi.isPositive ? 'text-success bg-green-50' : 'text-error bg-red-50'}`}>
                  {kpi.trend}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-xl font-black text-foreground">{kpi.value}</p>
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Chart */}
        <AppCard className="border-border shadow-sm">
          <AppCardHeader>
            <AppCardTitle className="text-lg font-bold">Tỷ Lệ Hoàn Thành Khóa Học</AppCardTitle>
            <AppCardDescription>So sánh tỷ lệ hoàn thành giữa các khóa học</AppCardDescription>
          </AppCardHeader>
          <AppCardContent className="h-[300px] w-full pt-0">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPLETION_DATA} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="rate" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </AppCardContent>
        </AppCard>

        {/* Engagement Trend */}
        <AppCard className="border-border shadow-sm">
          <AppCardHeader>
            <AppCardTitle className="text-lg font-bold">Lượng Truy Cập Hàng Ngày</AppCardTitle>
            <AppCardDescription>Số lượng học viên hoạt động trong tuần qua</AppCardDescription>
          </AppCardHeader>
          <AppCardContent className="h-[300px] w-full pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENGAGEMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </AppCardContent>
        </AppCard>

        {/* Device Distribution */}
        <AppCard className="border-border shadow-sm">
          <AppCardHeader>
            <AppCardTitle className="text-lg font-bold">Thiết Bị Truy Cập</AppCardTitle>
            <AppCardDescription>Tỷ lệ các loại thiết bị học viên sử dụng</AppCardDescription>
          </AppCardHeader>
          <AppCardContent className="h-[300px] w-full pt-0 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={DEVICE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DEVICE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
               {DEVICE_DATA.map((d, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                   <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{d.name} ({d.value}%)</span>
                 </div>
               ))}
            </div>
          </AppCardContent>
        </AppCard>

        {/* Top Content (Lessons) */}
        <AppCard className="border-border shadow-sm h-full">
          <AppCardHeader>
            <AppCardTitle className="text-lg font-bold">Bài Học Phổ Biến</AppCardTitle>
            <AppCardDescription>Những bài học có lượng truy cập nhiều nhất</AppCardDescription>
          </AppCardHeader>
          <AppCardContent className="p-0">
             <div className="flex flex-col">
               {[
                 { title: "Hướng dẫn cài đặt môi trường", views: "2.4k", time: "12m" },
                 { title: "Sử dụng Tailwind CSS trong Next.js", views: "1.8k", time: "25m" },
                 { title: "Xử lý Forms với React Hook Form", views: "1.5k", time: "18m" },
                 { title: "Kết nối API với Axios", views: "1.2k", time: "20m" },
               ].map((lesson, i) => (
                 <div key={i} className={`flex items-center justify-between p-4 ${i !== 3 ? 'border-b border-border' : ''} hover:bg-muted cursor-pointer transition-colors`}>
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">{i + 1}</div>
                     <span className="text-sm font-bold text-foreground line-clamp-1">{lesson.title}</span>
                   </div>
                   <div className="flex items-center gap-4 shrink-0">
                     <span className="text-xs font-bold text-info bg-blue-50 px-2 py-0.5 rounded">{lesson.views} views</span>
                     <ChevronRight className="w-4 h-4 text-slate-300" />
                   </div>
                 </div>
               ))}
             </div>
          </AppCardContent>
        </AppCard>
      </div>
    </div>
  );
}
