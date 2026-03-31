import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  BookOpen,
  PlayCircle,
} from "lucide-react";

// Mock data for enrolled courses
const MY_COURSES = [
  {
    id: 1,
    title: "Lập trình Web Frontend Bootcamp 2026",
    instructor: "ThS. Nguyên Trần",
    progress: 68,
    lastAccessed: "2 giờ trước",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop",
    totalLessons: 120,
    completedLessons: 82,
    status: "in_progress",
  },
  {
    id: 2,
    title: "Mastering React 18 & Next.js 14",
    instructor: "Phạm Hồng Việt",
    progress: 32,
    lastAccessed: "Hôm qua",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop",
    totalLessons: 85,
    completedLessons: 27,
    status: "in_progress",
  },
  {
    id: 3,
    title: "Thiết kế UI/UX Thực chiến với Figma",
    instructor: "Lê Minh Tâm",
    progress: 100,
    lastAccessed: "Tuần trước",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563fc4c?q=80&w=600&auto=format&fit=crop",
    totalLessons: 45,
    completedLessons: 45,
    status: "completed",
  },
  {
    id: 4,
    title: "Node.js & Express API Development",
    instructor: "Nguyễn Văn A",
    progress: 0,
    lastAccessed: "Chưa bắt đầu",
    image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop",
    totalLessons: 60,
    completedLessons: 0,
    status: "not_started",
  },
];

export default function MyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCourses = MY_COURSES.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <BreadcrumbLink href="/account" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Tài khoản
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-sm font-semibold">Khóa học của tôi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-primary" />
            Khóa học của tôi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bạn đang có tổng cộng {MY_COURSES.length} khóa học trong thư viện.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm khóa học của bạn..." 
            className="pl-9 h-11 border-slate-200 focus-visible:ring-primary bg-slate-50 focus-visible:bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 border-slate-200 bg-slate-50 min-w-40 font-semibold focus:ring-primary focus:bg-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="not_started">Chưa bắt đầu</SelectItem>
            <SelectItem value="in_progress">Đang học</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-lg transition-all group active:scale-[0.99]">
              <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {course.progress === 100 && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
                    Đã hoàn thành
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Link to={`/learning/${course.id}`}>
                    <button className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white transition-all text-primary">
                      <PlayCircle className="w-8 h-8 ml-1" />
                    </button>
                  </Link>
                </div>
              </div>
              
              <CardContent className="p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Giảng viên: {course.instructor}</p>
                </div>
                
                <div className="mt-2 space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-semibold text-slate-600">
                        Đã xem {course.completedLessons}/{course.totalLessons} bài
                      </span>
                      <span className={`text-sm font-bold ${course.progress === 100 ? "text-emerald-500" : "text-primary"}`}>
                        {course.progress}%
                      </span>
                    </div>
                    <Progress 
                      value={course.progress} 
                      className={`h-2 bg-slate-100 ${course.progress === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
                    />
                  </div>
                  
                  <Link to={`/learning/${course.id}`} className="block w-full">
                    <button 
                      className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors
                        ${course.progress === 100 
                          ? "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200" 
                          : course.progress === 0 
                            ? "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"}
                      `}
                    >
                      {course.progress === 100 ? "Ôn tập lại" : course.progress === 0 ? "Bắt đầu học ngay" : "Tiếp tục học"}
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy khóa học nào</h3>
          <p className="text-slate-500 mb-6">Bạn chưa sở hữu khóa học nào phù hợp với bộ lọc hiện tại.</p>
          <Link to="/courses">
            <button className="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Khám phá khóa học
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
