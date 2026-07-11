import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, PlayCircle, Award } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";

export default function MyCourseGrid({ loading, courses }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1,2,3,4].map(n => (
          <div key={n} className="h-80 bg-secondary animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 bg-muted rounded-lg border border-dashed border-border">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">Không tìm thấy khóa học nào</h3>
        <p className="text-muted-foreground mb-6">Bạn chưa sở hữu khóa học nào phù hợp với bộ lọc hiện tại.</p>
        <Link to="/courses">
          <AppButton appVariant="outlineGradient" className="font-bold border-2 border-primary text-primary hover:bg-primary/5">
            Khám phá khóa học
          </AppButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden border-border shadow-sm hover:shadow-xl transition-all group active:scale-[0.98] rounded-xl bg-white">
          <div className="relative h-52 sm:h-60 w-full p-4 pb-0">
            <div className="w-full h-full overflow-hidden rounded-lg relative shadow-inner bg-muted">
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
              <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-2">
                {course.courseTitle}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Giảng viên: {course.instructorName}</p>
            </div>
            
            <div className="mt-2 space-y-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {course.progressPercent === 100 ? "Hoàn thành khóa học" : "Tiến độ học tập"}
                  </span>
                  <span className={`text-sm font-bold ${course.progressPercent === 100 ? "text-emerald-500" : "text-primary"}`}>
                    {course.progressPercent}%
                  </span>
                </div>
                <Progress 
                  value={course.progressPercent} 
                  className={`h-2 bg-secondary ${course.progressPercent === 100 ? "[&>div]:bg-emerald-500" : ""}`} 
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
                      ? "bg-muted text-muted-foreground hover:bg-secondary border border-border" 
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
                   <AppButton appVariant="ghostMuted" variant="ghost" className="w-full py-2.5 text-sm font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors gap-2">
                       <Award className="w-4 h-4" /> Xem chứng chỉ
                   </AppButton>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
