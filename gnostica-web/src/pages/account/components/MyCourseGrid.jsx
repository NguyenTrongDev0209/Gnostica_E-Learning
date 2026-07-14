import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { AppButton } from "@/components/common/micro/AppButton";
import { CourseProgressCard } from "@/components/common/composite/CourseCard";

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
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseProgressCard
          key={course.id}
          id={course.id}
          title={course.courseTitle}
          category={course.category}
          image={course.courseThumbnail}
          instructor={course.instructorName}
          progressPercent={course.progressPercent}
          lastAccessed={course.lastAccessed}
          completedAt={course.completedAt}
          joinedAt={course.joinedAt}
          firstLessonId={course.firstLessonId}
          lastWatchedLessonSlug={course.lastWatchedLessonSlug}
          certifiUrl={course.certifiUrl}
          link={`/learning/${course.courseSlug}${course.progressPercent === 100 ? `?lesson=${course.firstLessonId}&restart=true` : (course.lastWatchedLessonSlug ? `?lesson=${course.lastWatchedLessonSlug}` : "")}`}
        />
      ))}
    </div>
  );
}
