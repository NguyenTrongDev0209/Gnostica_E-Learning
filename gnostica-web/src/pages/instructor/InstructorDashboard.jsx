import React from "react";
import { Link } from "react-router-dom";
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
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const MY_COURSES = [
  { 
    id: "CRS-001", 
    title: "Fullstack Next.js Masterclass", 
    students: 1245, 
    rating: 4.9, 
    revenue: "15.000.000đ",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-005", 
    title: "React Native cho người mới bắt đầu", 
    students: 512, 
    rating: 4.7, 
    revenue: "4.500.000đ",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=200&auto=format&fit=crop"
  },
  { 
    id: "CRS-008", 
    title: "Tailwind CSS Thực chiến", 
    students: 890, 
    rating: 4.8, 
    revenue: "5.000.000đ",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=200&auto=format&fit=crop"
  },
];

const RECENT_REVIEWS = [
  { id: 1, user: "minhle.dev", course: "Fullstack Next.js Masterclass", rating: 5, content: "Khóa học rất chi tiết và dễ hiểu, mình làm được app luôn sau khi học xong chương 2.", time: "2 giờ trước" },
  { id: 2, user: "quangtran99", course: "React Native cho người mới bắt đầu", rating: 4, content: "Nội dung ok nhưng video hơi bé ở đoạn viết code.", time: "5 giờ trước" },
  { id: 3, user: "huyenkute", course: "Tailwind CSS Thực chiến", rating: 5, content: "Đỉnh chóp anh ơi, UI mượt mà dã man.", time: "1 ngày trước" },
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Xu Hướng Doanh Thu</CardTitle>
                <CardDescription>Tổng hợp doanh thu từ tất cả các khóa học</CardDescription>
              </div>
              <select className="text-xs font-bold border-slate-200 rounded-md bg-slate-50 p-1">
                <option>6 Tháng qua</option>
                <option>12 Tháng qua</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#166534" stopOpacity={0}/>
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
                  tickFormatter={(value) => `${value/1000000}Tr`}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Courses (Takes up 2 cols) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-lg font-bold">Khóa Học Của Bạn</CardTitle>
              <CardDescription>Hiệu suất chi tiết các khóa học đang bán</CardDescription>
            </div>
            <Link to="/instructor/courses" className="text-xs text-green-600 font-bold hover:underline px-3 py-1.5 bg-green-50 rounded-lg">
              Quản lý tất cả
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex flex-col">
            <div className="flex flex-col">
              {MY_COURSES.map((course, index) => (
                <div key={course.id} className={`flex items-center justify-between p-4 ${index !== MY_COURSES.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{course.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" /> {course.students} HV
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-current" /> {course.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-green-600 text-sm">{course.revenue}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tháng này</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50/50">
              <Link to="/instructor/courses/courses-form" className="block w-full">
                <Button variant="outline" className="w-full font-bold border-dashed border-slate-300 text-slate-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50/50 transition-all">
                  <Plus className="w-4 h-4 mr-2" /> Thêm khóa học mới
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Right: Recent Reviews */}
        <Card className="border-slate-200 shadow-sm flex flex-col h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold">Phản hồi mới</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {RECENT_REVIEWS.map((review, index) => (
                <div key={review.id} className={`p-4 ${index !== RECENT_REVIEWS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                        {review.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-slate-900">{review.user}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{review.time}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2 italic">"{review.content}"</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Khóa: <span className="text-slate-600">{review.course}</span></p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100">
               <Button variant="ghost" className="w-full text-xs font-bold text-slate-500 hover:text-primary">
                 Xem tất cả đánh giá
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

