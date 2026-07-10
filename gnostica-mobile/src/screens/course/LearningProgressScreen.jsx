import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Trophy, Clock, Activity, CheckCircle2 } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import enrollmentService from '../../services/course/enrollmentService';

export default function LearningProgressScreen() {
    const navigation = useNavigation();
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({ active: 0, completed: 0, hours: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch courses and stats
                const [coursesRes, statsRes] = await Promise.all([
                    enrollmentService.getMyCourses(),
                    enrollmentService.getStats()
                ]);

                const courseData = coursesRes.data || coursesRes.content || coursesRes;
                if (Array.isArray(courseData)) {
                    setCourses(courseData);
                }

                const statsData = statsRes.data || statsRes;
                if (statsData) {
                    setStats({
                        active: statsData.active || courseData?.filter?.(c => c.progress < 100).length || 0,
                        completed: statsData.completed || courseData?.filter?.(c => c.progress === 100).length || 0,
                        hours: statsData.totalHours || statsData.hours || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching learning progress:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Tiến trình học tập" />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Stats row */}
                    <View className="flex-row p-5 gap-3">
                        {[
                            { label: 'Đang học', value: stats.active, icon: BookOpen, color: '#3B82F6', bg: 'bg-blue-50' },
                            { label: 'Hoàn thành', value: stats.completed, icon: Trophy, color: '#10B981', bg: 'bg-emerald-50' },
                            { label: 'Giờ học', value: `${stats.hours}h`, icon: Clock, color: '#8B5CF6', bg: 'bg-purple-50' },
                        ].map(stat => (
                            <View key={stat.label} className={`flex-1 ${stat.bg} p-4 rounded-2xl border border-slate-100 items-center`}>
                                <stat.icon size={24} color={stat.color} />
                                <AppText className="text-[22px] font-extrabold mt-2 text-slate-800">{stat.value}</AppText>
                                <AppText className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</AppText>
                            </View>
                        ))}
                    </View>

                    {/* Course List */}
                    <View className="px-5 pb-10">
                        <AppText className="text-base font-extrabold text-slate-800 mb-4 flex-row items-center">
                            <Activity size={18} color="#334155" /> Chi tiết khóa học
                        </AppText>

                        {courses.length === 0 ? (
                            <View className="items-center py-10 bg-white rounded-2xl border border-slate-100">
                                <AppText className="text-slate-500">Bạn chưa học khóa nào.</AppText>
                            </View>
                        ) : (
                            courses.map(course => {
                                const progress = course.progress || 0;
                                const completedLessons = course.completedLessons || 0;
                                const totalLessons = course.totalLessons || 0;

                                return (
                                    <View key={course.id || course.courseId} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm">
                                        <AppText className="text-sm font-bold text-slate-800 mb-3" numberOfLines={2}>{course.title || course.courseTitle}</AppText>
                                        <View className="flex-row justify-between mb-1.5 items-end">
                                            <AppText className="text-xs text-slate-500 font-medium">Tiến độ {progress}%</AppText>
                                            <AppText className="text-[10px] text-slate-400">{completedLessons}/{totalLessons} bài</AppText>
                                        </View>
                                        <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <View 
                                                className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                                style={{ width: `${progress}%` }} 
                                            />
                                        </View>
                                        {progress === 100 && (
                                            <View className="flex-row items-center mt-3 gap-1">
                                                <CheckCircle2 size={14} color="#10B981" />
                                                <AppText className="text-xs font-semibold text-emerald-500">Đã hoàn thành</AppText>
                                            </View>
                                        )}
                                    </View>
                                )
                            })
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
