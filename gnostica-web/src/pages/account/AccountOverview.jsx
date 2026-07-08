import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";
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
import useAuthStore from "@/store/useAuthStore";
import enrollmentService from "@/services/course/enrollmentService";
import { Skeleton } from "@/components/ui/skeleton";

import useAccountOverview from "@/hooks/user/useAccountOverview";

export default function AccountOverview() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const isInstructor = (user?.role || '').toUpperCase() === 'INSTRUCTOR';

  const { stats, recentCourses, recentCertificates, loading } = useAccountOverview();

  const handleBecomeInstructor = () => {
    navigate('/apply-instructor');
  };

  const statItems = [
    { 
      label: "Khóa học đang học", 
      value: stats?.enrolledCourses || "0", 
      icon: BookOpen, 
      color: "text-info bg-blue-50" 
    },
    { 
      label: "Chứng chỉ đạt được", 
      value: stats?.completedCourses || "0", 
      icon: Award, 
      color: "text-emerald-500 bg-emerald-50" 
    },
    { 
      label: "Số giờ đã học", 
      value: stats?.hoursStudied?.toFixed(1) || "0", 
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
            <BreadcrumbPage className="text-sm font-semibold">Tổng quan</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Tổng quan học tập</h1>
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
            Tiếp tục hành trình chinh phục kiến thức mới hôm nay nhé. Mỗi phút học tập đều đưa bạn đến gần hơn với mục tiêu!
          </p>
        </CardContent>
      </Card>

      {/* Instructor Promotion Banner */}
      {!isInstructor && (
        <Card className="border-2 border-dashed border-warning/20 bg-orange-50/50 mb-6 group cursor-pointer hover:bg-orange-50 transition-colors" onClick={handleBecomeInstructor}>
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center text-warning shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Chia sẻ kiến thức, tạo nguồn thu nhập</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">Đăng ký trở thành giảng viên trên Gnostica ngay hôm nay.</p>
              </div>
            </div>
            <SimpleButton variant="outline" className="border-warning/20 text-warning hover:bg-warning/10 text-warning hover:text-white shrink-0 font-bold hidden sm:flex">
              Đăng ký ngay
            </SimpleButton>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="border-border shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Tiếp tục học tập</h2>
            <Link to="/account/my-courses" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <Card key={i} className="border-border shadow-sm">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                    <Skeleton className="w-full sm:w-40 h-28 sm:h-24 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex items-center gap-4 pt-4">
                        <Skeleton className="h-2 flex-1" />
                        <Skeleton className="w-10 h-10 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <Card key={course.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                    <div className="w-full sm:w-40 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-border">
                      <img src={course.courseThumbnail} alt={course.courseTitle} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h3 className="font-bold text-foreground line-clamp-2">{course.courseTitle}</h3>
                        {course.progressPercent === 100 && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shrink-0">Hoàn thành</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Giảng viên: {course.instructorName} • Đã tham gia {new Date(course.joinedAt).toLocaleDateString('vi-VN')}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className={course.progressPercent === 100 ? "text-emerald-500" : "text-primary"}>
                              {course.progressPercent}%
                            </span>
                          </div>
                          <Progress value={course.progressPercent} className={`h-2 ${course.progressPercent === 100 ? "[&>div]:bg-emerald-500" : ""}`} />
                        </div>
                        <Link to={`/courses/${course.courseSlug}/learn`}>
                          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary hover:bg-primary hover:text-white text-muted-foreground transition-colors shrink-0">
                            <PlayCircle className="w-5 h-5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-muted shadow-none">
                <CardContent className="p-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Bạn chưa đăng ký khóa học nào</p>
                    <p className="text-sm text-muted-foreground mt-1">Hãy khám phá các khóa học hấp dẫn trên Gnostica</p>
                  </div>
                  <Link to="/courses">
                    <SimpleButton variant="outline" className="mt-2 font-bold">Khám phá ngay</SimpleButton>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Chứng chỉ mới nhất</h2>
            <Link to="/account/certificates" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))
            ) : recentCertificates.length > 0 ? (
              recentCertificates.map((cert) => (
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
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent shadow-none border-border">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Hoàn thành thêm khóa học để nhận chứng chỉ
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
