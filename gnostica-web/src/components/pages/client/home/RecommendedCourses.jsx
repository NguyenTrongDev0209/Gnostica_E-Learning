import React, { useEffect, useState } from 'react';
import courseService from '@/services/courseService';
import authService from '@/services/authService';
import AppCard from '@/components/common/AppCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';

const RecommendedCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();

    useEffect(() => {
        if (user) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchRecommendations = async () => {
        try {
            const data = await courseService.getRecommendedCourses(0, 4);
            setCourses(data.content || []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || (!loading && courses.length === 0)) return null;

    return (
        <section className="w-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Dành riêng cho bạn</h2>
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
                        <AppCard
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
