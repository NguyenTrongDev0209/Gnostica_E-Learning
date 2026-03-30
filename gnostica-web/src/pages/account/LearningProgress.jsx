import React from "react";
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
} from "lucide-react";

const PROGRESS_DATA = [
  {
    id: 1,
    title: "Lập trình Web Frontend Bootcamp 2026",
    progress: 68,
    totalTime: "45h 30m",
    timeSpent: "31h 15m",
    quizzesTaken: 12,
    quizzesTotal: 18,
    lastActive: "Hôm nay, 14:30",
    color: "bg-blue-500",
  },
  {
    id: 2,
    title: "Mastering React 18 & Next.js 14",
    progress: 32,
    totalTime: "30h 00m",
    timeSpent: "9h 40m",
    quizzesTaken: 3,
    quizzesTotal: 10,
    lastActive: "Hôm qua",
    color: "bg-orange-500",
  },
  {
    id: 3,
    title: "Thiết kế UI/UX Thực chiến với Figma",
    progress: 100,
    totalTime: "20h 15m",
    timeSpent: "20h 15m",
    quizzesTaken: 8,
    quizzesTotal: 8,
    lastActive: "Tuần trước",
    color: "bg-emerald-500",
  },
];

const OVERALL_STATS = [
  { label: "Ngày học liên tiếp", value: "5 ngày", icon: Flame, color: "text-orange-500 bg-orange-50" },
  { label: "Mục tiêu tuần", value: "8/10 giờ", icon: Target, color: "text-blue-500 bg-blue-50" },
  { label: "Xếp hạng", value: "Top 12%", icon: Trophy, color: "text-yellow-500 bg-yellow-50" },
];

export default function LearningProgress() {
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
        {OVERALL_STATS.map((stat) => {
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
        })}
      </div>

      {/* Detailed Progress List */}
      <div className="space-y-4">
        {PROGRESS_DATA.map((course) => (
          <Card key={course.id} className="border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Info Section */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{course.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      Thời gian: <strong className="text-slate-700">{course.timeSpent} / {course.totalTime}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      Bài tập: <strong className="text-slate-700">{course.quizzesTaken}/{course.quizzesTotal}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      Lần cuối: <strong className="text-slate-700">{course.lastActive}</strong>
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-semibold text-slate-500">Tiến độ tổng thể</span>
                      <span className={`text-lg font-black ${course.progress === 100 ? "text-emerald-500" : "text-primary"}`}>
                        {course.progress}%
                      </span>
                    </div>
                    <Progress 
                      value={course.progress} 
                      className={`h-3 bg-slate-100 ${course.progress === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex md:flex-col gap-3 justify-end items-end border-t border-slate-100 pt-4 md:border-0 md:pt-0">
                  <Link to={`/courses/${course.id}`}>
                    <button className="px-6 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">
                      {course.progress === 100 ? "Xem lại bài" : "Học ngay"}
                    </button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
