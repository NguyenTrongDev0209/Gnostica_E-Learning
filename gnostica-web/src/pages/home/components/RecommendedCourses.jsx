import React from 'react';
import CourseCard from "@/components/common/composite/CourseCard";
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import useRecommendedCourses from '@/hooks/course/useRecommendedCourses';

const RecommendedCourses = () => {
    const { courses, loading, user } = useRecommendedCourses(4);

    if (!user || (!loading && courses.length === 0)) return null;

    return (
        <section className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-warning/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Dành riêng cho bạn</h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {courses.map(course => (
                        <CourseCard
                            key={course.id}
                            image={course.thumbnail}
                            title={course.title}
                            category={course.categoryName}
                            students={course.students}
                            price={course.salePrice?.toLocaleString()}
                            originalPrice={course.discount > 0 ? course.price?.toLocaleString() : null}
                            discountPercentage={course.discount}
                            instructor={{
                                name: course.instructorName,
                                avatar: course.instructorAvatar,
                                status: "online"
                            }}
                            link={`/courses/${course.slug}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default RecommendedCourses;

