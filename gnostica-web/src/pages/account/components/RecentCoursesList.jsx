import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SimpleButton } from "@/components/common/micro/AppButton";

export default function RecentCoursesList({ loading, recentCourses }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(2).fill(0).map((_, i) => (
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
        ))}
      </div>
    );
  }

  if (recentCourses.length === 0) {
    return (
      <div className="space-y-4">
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
              <SimpleButton className="mt-2 font-bold bg-transparent text-primary border border-primary hover:bg-primary/5">Khám phá ngay</SimpleButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentCourses.map((course) => (
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
      ))}
    </div>
  );
}
