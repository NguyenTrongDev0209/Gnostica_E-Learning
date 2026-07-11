import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/common/micro/AppButton";

export default function LearningProgressList({ loading, courses }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i} className="border-border shadow-sm">
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
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted shadow-none text-center p-10 border-border">
        <p className="text-muted-foreground">Bạn chưa đăng ký khóa học nào.</p>
        <Link to="/courses" className="text-primary font-bold hover:underline mt-2 inline-block">
          Khám phá khóa học ngay
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id} className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Info Section */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">{course.courseTitle}</h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted"></span>
                    Bài viết: <strong className="text-foreground">{course.completedLessons}/{course.totalLessons}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted"></span>
                    Tham gia: <strong className="text-foreground">{new Date(course.joinedAt).toLocaleDateString('vi-VN')}</strong>
                  </span>
                  {course.completedAt && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Hoàn thành: <strong className="text-foreground">{new Date(course.completedAt).toLocaleDateString('vi-VN')}</strong>
                    </span>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-semibold text-muted-foreground">Tiến độ tổng thể</span>
                    <span className={`text-lg font-black ${course.progressPercent === 100 ? "text-emerald-500" : "text-primary"}`}>
                      {course.progressPercent}%
                    </span>
                  </div>
                  <Progress 
                    value={course.progressPercent} 
                    className={`h-3 bg-secondary ${course.progressPercent === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 flex md:flex-col gap-3 justify-end items-end border-t border-border pt-4 md:border-0 md:pt-0">
                <Link to={`/learning/${course.courseId}`}>
                  {course.progressPercent === 100 ? (
                    <AppButton appVariant="ghostMuted" variant="ghost" className="px-6 border border-border">Xem lại bài</AppButton>
                  ) : (
                    <AppButton appVariant="gradient" className="px-6 font-bold">Học ngay</AppButton>
                  )}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
