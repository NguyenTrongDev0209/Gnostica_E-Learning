import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
  Activity,
  Trophy,
  Target,
  Flame,
  BookOpen,
  Clock,
} from "lucide-react";
import enrollmentService from "@/services/enrollmentService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function LearningProgress() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, coursesRes] = await Promise.all([
          enrollmentService.getMyStats(),
          enrollmentService.getMyCourses()
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }

        if (coursesRes.success) {
          setCourses(coursesRes.data);
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
        toast.error("Không thể tải thông tin tiến độ học tập");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const overallStats = [
    { 
      label: "Khóa học đăng ký", 
      value: stats?.enrolledCourses || "0", 
      icon: BookOpen, 
      color: "text-blue-500 bg-blue-50" 
    },
    { 
      label: "Khóa hoàn thành", 
      value: stats?.completedCourses || "0", 
      icon: Trophy, 
      color: "text-emerald-500 bg-emerald-50" 
    },
    { 
      label: "Tổng giờ đã học", 
      value: `${stats?.hoursStudied?.toFixed(1) || "0"}h`, 
      icon: Clock, 
      color: "text-purple-500 bg-purple-50" 
    },
  ];

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
            <BreadcrumbPage className="text-sm font-semibold">Tiến độ học tập</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
          <Activity className="w-7 h-7 text-primary" />
          Tiến độ học tập
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi quá trình học tập và hoàn thành mục tiêu của bạn.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-none shadow bg-white">
              <CardContent className="p-5 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          overallStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-none shadow bg-white">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detailed Progress List */}
      <div className="space-y-4">
        {loading ? (
          Array(2).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Info Section */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{course.courseTitle}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        Bài viết: <strong className="text-slate-700">{course.completedLessons}/{course.totalLessons}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        Tham gia: <strong className="text-slate-700">{new Date(course.joinedAt).toLocaleDateString('vi-VN')}</strong>
                      </span>
                      {course.completedAt && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Hoàn thành: <strong className="text-slate-700">{new Date(course.completedAt).toLocaleDateString('vi-VN')}</strong>
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-slate-500">Tiến độ tổng thể</span>
                        <span className={`text-lg font-black ${course.progressPercent === 100 ? "text-emerald-500" : "text-primary"}`}>
                          {course.progressPercent}%
                        </span>
                      </div>
                      <Progress 
                        value={course.progressPercent} 
                        className={`h-3 bg-slate-100 ${course.progressPercent === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex md:flex-col gap-3 justify-end items-end border-t border-slate-100 pt-4 md:border-0 md:pt-0">
                    <Link to={`/learning/${course.courseId}`}>
                      <button className="px-6 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">
                        {course.progressPercent === 100 ? "Xem lại bài" : "Học ngay"}
                      </button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-2 bg-slate-50/50 shadow-none text-center p-10">
            <p className="text-slate-500">Bạn chưa đăng ký khóa học nào.</p>
            <Link to="/courses" className="text-primary font-bold hover:underline mt-2 inline-block">
              Khám phá khóa học ngay
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
