import React, { useEffect, useState } from 'react';
import AppCard from '@/components/common/AppCard';
import courseService from '@/services/courseService';

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses(0, 8); // Fetch first 8 courses
        setCourses(data.content || []);
      } catch (error) {
        console.error("Lỗi khi tải khóa học thịnh hành:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
        <AppCard
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
