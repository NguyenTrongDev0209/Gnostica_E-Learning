import React, { useState, useEffect } from "react";
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
  Award,
} from "lucide-react";

import enrollmentService from "@/services/enrollmentService";
import { toast } from "sonner";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getMyCourses();
      if (response && response.data) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      toast.error("Không thể tải danh sách khóa học của bạn");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (progress) => {
    if (progress === 100) return "completed";
    if (progress > 0) return "in_progress";
    return "not_started";
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStatus(course.progressPercent);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
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
            Bạn đang có tổng cộng {courses.length} khóa học trong thư viện.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-80 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-xl transition-all group active:scale-[0.98] rounded-xl bg-white">
              <div className="relative h-52 sm:h-60 w-full p-4 pb-0">
                <div className="w-full h-full overflow-hidden rounded-lg relative shadow-inner bg-slate-50">
                  <img 
                    src={course.courseThumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop"} 
                    alt={course.courseTitle} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {course.progressPercent === 100 && (
                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      Đã hoàn thành
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Link to={course.progressPercent === 100 
                      ? `/learning/${course.courseSlug}?lesson=${course.firstLessonId}&restart=true` 
                      : `/learning/${course.courseSlug}${course.lastWatchedLessonSlug ? `?lesson=${course.lastWatchedLessonSlug}` : ""}`}>
                      <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all text-primary">
                        <PlayCircle className="w-10 h-10 ml-1" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                    {course.courseTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">Giảng viên: {course.instructorName}</p>
                </div>
                
                <div className="mt-2 space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-xs font-semibold text-slate-600">
                        {course.progressPercent === 100 ? "Hoàn thành khóa học" : "Tiến độ học tập"}
                      </span>
                      <span className={`text-sm font-bold ${course.progressPercent === 100 ? "text-emerald-500" : "text-primary"}`}>
                        {course.progressPercent}%
                      </span>
                    </div>
                    <Progress 
                      value={course.progressPercent} 
                      className={`h-2 bg-slate-100 ${course.progressPercent === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
                    />
                  </div>
                  
                  <Link 
                    to={course.progressPercent === 100 
                      ? `/learning/${course.courseSlug}?lesson=${course.firstLessonId}&restart=true` 
                      : `/learning/${course.courseSlug}${course.lastWatchedLessonSlug ? `?lesson=${course.lastWatchedLessonSlug}` : ""}`} 
                    className="block w-full"
                  >
                    <button 
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors
                        ${course.progressPercent === 100 
                          ? "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200" 
                          : course.progressPercent === 0 
                            ? "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"}
                      `}
                    >
                      {course.progressPercent === 100 ? "Ôn tập lại" : course.progressPercent === 0 ? "Bắt đầu học ngay" : "Tiếp tục học"}
                    </button>
                  </Link>
                  {course.progressPercent === 100 && course.certifiUrl && (
                    <Link to={`/certificate/${course.certifiUrl}`} target="_blank" className="block w-full">
                       <button className="w-full py-2.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-2">
                           <Award className="w-4 h-4" /> Xem chứng chỉ
                       </button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Không tìm thấy khóa học nào</h3>
          <p className="text-slate-500 mb-6">Bạn chưa sở hữu khóa học nào phù hợp với bộ lọc hiện tại.</p>
          <Link to="/courses">
            <button className="px-6 py-2.5 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">
              Khám phá khóa học
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
