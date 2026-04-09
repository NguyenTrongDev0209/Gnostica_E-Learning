import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Home,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  PlayCircle,
  Trophy,
} from "lucide-react";
import { SimpleButton } from "@/components/common/AppButton";
import authService from "@/services/authService";

const STATS = [
  { label: "Khóa học đang học", value: "4", icon: BookOpen, color: "text-blue-500 bg-blue-50" },
  { label: "Chứng chỉ đạt được", value: "2", icon: Award, color: "text-emerald-500 bg-emerald-50" },
  { label: "Số giờ đã học", value: "32", icon: Clock, color: "text-purple-500 bg-purple-50" },
];

const RECENT_COURSES = [
  {
    id: 1,
    title: "Lập trình Web Frontend Bootcamp 2026",
    instructor: "ThS. Nguyên Trần",
    progress: 68,
    lastAccessed: "2 giờ trước",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Mastering React 18 & Next.js 14",
    instructor: "Phạm Hồng Việt",
    progress: 32,
    lastAccessed: "Hôm qua",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Thiết kế UI/UX Thực chiến với Figma",
    instructor: "Lê Minh Tâm",
    progress: 100,
    lastAccessed: "Tuần trước",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=200&auto=format&fit=crop",
  },
];

const RECENT_CERTIFICATES = [
  {
    id: 1,
    title: "Thiết kế UI/UX Thực chiến",
    date: "15/03/2026",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: 2,
    title: "JavaScript Cơ bản",
    date: "10/01/2026",
    color: "from-blue-500 to-cyan-500",
  },
];

export default function AccountOverview() {
  const user = authService.getCurrentUser();
  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-3.5 w-3.5" /> Trang chủ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Tổng quan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Tổng quan học tập</h1>
        <Link to="/courses">
          <SimpleButton className="w-full sm:w-auto font-bold gap-2">
            Khám phá khóa học mới
          </SimpleButton>
        </Link>
      </div>

      {/* Welcome Banner */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 text-white mb-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-32 h-32" />
        </div>
        <CardContent className="p-6 md:p-8 relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
            Chào mừng trở lại, {user?.fullName || "Học viên"}! 👋
          </h2>
          <p className="text-slate-200 text-sm leading-relaxed max-w-xl">
            Bạn đã học liên tục 5 ngày tuần này. Tiếp tục phát huy nhé! Khóa học "Lập trình Web Frontend Bootcamp 2026" đang chờ bạn hoàn thành.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Tiếp tục học tập</h2>
            <Link to="/account/my-courses" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {RECENT_COURSES.map((course) => (
              <Card key={course.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-40 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="font-bold text-slate-900 line-clamp-2">{course.title}</h3>
                      {course.progress === 100 && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shrink-0">Hoàn thành</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Giảng viên: {course.instructor} • Đã xem {course.lastAccessed}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                          <span className={course.progress === 100 ? "text-emerald-500" : "text-primary"}>
                            {course.progress}%
                          </span>
                        </div>
                        <Progress value={course.progress} className={`h-2 ${course.progress === 100 ? "[&>div]:bg-emerald-500" : ""}`} />
                      </div>
                      <Link to={`/courses/${course.id}`}>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-primary hover:text-white text-slate-600 transition-colors shrink-0">
                          <PlayCircle className="w-5 h-5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Chứng chỉ mới nhất</h2>
            <Link to="/account/certificates" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {RECENT_CERTIFICATES.map((cert) => (
              <div 
                key={cert.id} 
                className={`p-5 rounded-2xl bg-gradient-to-br ${cert.color} text-white shadow-lg relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                <Award className="w-8 h-8 text-white/80 mb-3" />
                <h3 className="font-bold text-lg leading-tight mb-4">{cert.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-white/80">Cấp ngày: {cert.date}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}

            <Card className="border-dashed border-2 bg-transparent shadow-none border-slate-200">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Hoàn thành thêm khóa học để nhận chứng chỉ
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
}
