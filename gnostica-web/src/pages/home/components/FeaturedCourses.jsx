import React from 'react';
import CourseCard from "@/components/common/composite/CourseCard";
import useFeaturedCourses from '@/hooks/course/useFeaturedCourses';

const FeaturedCourses = () => {
  const { courses, loading } = useFeaturedCourses(8);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center w-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-80 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="w-full text-center py-12 text-muted-foreground">
        Chưa có khóa học nào được hiển thị.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center w-full">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          category={course.categoryName}
          rating={4.8} // Default rating for now
          title={course.title}
          classes={course.classes}
          students={course.students}
          price={new Intl.NumberFormat('vi-VN').format(course.finalPrice || course.price)}
          originalPrice={course.discount > 0 ? new Intl.NumberFormat('vi-VN').format(course.price) : null}
          discountPercentage={course.discount}
          image={course.thumbnail}
          instructor={{
            name: course.instructorName,
            avatar: course.instructorAvatar,
            status: "online"
          }}
          link={`/courses/${course.slug}`}
        />
      ))}
    </div>
  );
};

export default FeaturedCourses;

