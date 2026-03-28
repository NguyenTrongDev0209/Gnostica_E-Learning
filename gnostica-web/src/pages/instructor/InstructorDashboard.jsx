import React from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock Data
const STATS = [
  { 
    title: "Doanh Thu Tháng Này", 
    value: "24.500.000đ", 
    trend: "+15.3%", 
    isPositive: true,
    icon: TrendingUp,
    color: "text-green-600 bg-green-50 border-green-100"
  },
  { 
    title: "Tổng Học Viên", 
    value: "8,942", 
    trend: "+2.4%", 
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
    title: "Câu Hỏi Mới", 
    value: "15", 
    trend: "-5%", 
    isPositive: false,
    icon: MessageSquare,
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Khu vực Giảng viên</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chào mừng trở lại, Sonny Sangha! Dưới đây là tình hình các khóa học của bạn.
          </p>
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Top Courses (Takes up 2 cols) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Khóa Học Nổi Bật</CardTitle>
            <Link to="/instructor/courses" className="text-sm text-green-600 font-medium hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1">
            <div className="flex flex-col">
              {MY_COURSES.map((course, index) => (
                <div key={course.id} className={`flex items-center justify-between p-4 ${index !== MY_COURSES.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50/50 transition-colors`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{course.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {course.students} học viên
                        </span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-current" /> {course.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right pl-4">
                    <p className="text-xs text-slate-500 mb-1">Doanh thu tháng</p>
                    <p className="font-bold text-green-600">{course.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 mt-auto border-t border-slate-100">
              <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-700 hover:bg-slate-50">
                Thêm khóa học mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Recent Reviews & Q&A */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">Đánh giá mới nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {RECENT_REVIEWS.map((review, index) => (
                <div key={review.id} className={`p-4 ${index !== RECENT_REVIEWS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {review.user.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-slate-900">{review.user}</span>
                    </div>
                    <span className="text-xs text-slate-500">{review.time}</span>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">{review.content}</p>
                  <p className="text-xs font-medium text-slate-400">Từ khóa học: <span className="text-slate-600">{review.course}</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
