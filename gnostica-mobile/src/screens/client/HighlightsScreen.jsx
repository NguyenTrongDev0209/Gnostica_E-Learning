import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Flame, TrendingUp, Award, Star, Users } from 'lucide-react-native';
import CourseCard from '../../components/home/CourseCard';
import courseService from '../../services/courseService';

const STATS = [
    { label: 'Khóa học', value: '200+', icon: Award, color: '#3B82F6' },
    { label: 'Học viên', value: '50K+', icon: Users, color: '#10B981' },
    { label: 'Đánh giá', value: '4.8',  icon: Star,  color: '#F59E0B' },
];

const HighlightsScreen = () => {
    const navigation = useNavigation();
    const [topCourses, setTopCourses] = useState([]);
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                // Giả lập 2 call API cho Top courses (ví dụ sortBy = students) và Featured
                const [topRes, featRes] = await Promise.all([
                    courseService.getAll({ sortBy: 'students', sortDir: 'desc', size: 3 }),
                    courseService.getAll({ size: 5 }) // Tạm dùng getAll cho featured
                ]);
                
                const formatCourse = (course) => ({
                    id: course.id.toString(),
                    slug: course.slug,
                    title: course.title,
                    thumbnail: course.thumbnail,
                    instructor: course.instructorName || 'Giảng viên',
                    rating: 4.5,
                    category: course.categoryName,
                    studentCount: course.students || 0,
                    price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice),
                    originalPrice: course.discount > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : null
                });

                if (topRes.content) {
                    setTopCourses(topRes.content.map(formatCourse));
                }
                if (featRes.content) {
                    setFeaturedCourses(featRes.content.map(formatCourse));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHighlights();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
            {/* Hero Banner */}
            <ImageBackground
                source={{ uri: 'https://picsum.photos/seed/highlights/800/400' }}
                className="pt-14 pb-8 px-5"
                style={{ minHeight: 220 }}
                imageStyle={{ opacity: 0.15 }}
            >
                <View className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b" style={{ backgroundColor: 'rgba(225, 29, 72, 0.9)' }} />

                <View className="relative z-10">
                    <View className="flex-row items-center mb-3">
                        <Flame size={28} color="#fff" fill="#fff" />
                        <AppText className="text-white text-2xl font-extrabold ml-2">Nổi bật</AppText>
                    </View>
                    <AppText className="text-white/80 text-sm leading-5">
                        Khám phá những khóa học được yêu thích nhất và trending trên Gnostica.
                    </AppText>

                    {/* Stats Row */}
                    <View className="flex-row mt-5 gap-3">
                        {STATS.map(stat => (
                            <View key={stat.label} className="flex-1 bg-white/15 rounded-2xl py-3 items-center">
                                <stat.icon size={18} color="#fff" />
                                <AppText className="text-white font-extrabold text-lg mt-1">{stat.value}</AppText>
                                <AppText className="text-white/60 text-[10px] font-medium">{stat.label}</AppText>
                            </View>
                        ))}
                    </View>
                </View>
            </ImageBackground>

            {/* Trending Section */}
            <View className="px-5 mt-6">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-2">
                        <TrendingUp size={20} color="#e32f45" />
                        <AppText className="text-lg font-extrabold text-slate-800">Trending ngay bây giờ</AppText>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('CourseCatalog')}>
                        <AppText className="text-sm text-blue-600 font-semibold">Xem tất cả</AppText>
                    </TouchableOpacity>
                </View>

                {topCourses.map((course, index) => (
                    <TouchableOpacity
                        key={course.id}
                        className="bg-white rounded-2xl p-3.5 mb-3 shadow-sm border border-slate-100 flex-row items-center"
                        onPress={() => navigation.navigate('CourseDetail', { course })}
                        activeOpacity={0.85}
                    >
                        {/* Rank Badge */}
                        <View className="w-8 h-8 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: index === 0 ? '#FEF3C7' : index === 1 ? '#F1F5F9' : '#FFF7ED' }}
                        >
                            <AppText className="font-extrabold text-sm"
                                style={{ color: index === 0 ? '#B45309' : index === 1 ? '#475569' : '#C2410C' }}
                            >
                                {index + 1}
                            </AppText>
                        </View>

                        <Image
                            source={{ uri: course.thumbnail }}
                            className="w-14 h-14 rounded-xl bg-slate-200"
                        />

                        <View className="flex-1 ml-3">
                            <AppText className="text-[13px] font-bold text-slate-800" numberOfLines={1}>
                                {course.title}
                            </AppText>
                            <AppText className="text-xs text-slate-400 mt-0.5">{course.instructor}</AppText>
                            <View className="flex-row items-center mt-1 gap-2">
                                <View className="flex-row items-center">
                                    <Star size={10} color="#F59E0B" fill="#F59E0B" />
                                    <AppText className="text-[10px] text-slate-500 font-medium ml-0.5">{course.rating}</AppText>
                                </View>
                                <AppText className="text-[10px] text-slate-300">•</AppText>
                                <AppText className="text-[10px] text-slate-400">{course.studentCount?.toLocaleString()} học viên</AppText>
                            </View>
                        </View>

                        <AppText className="text-sm font-extrabold text-blue-600">{course.price}</AppText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Featured Courses Horizontal */}
            <View className="mt-6">
                <View className="flex-row items-center justify-between px-5 mb-4">
                    <AppText className="text-lg font-extrabold text-slate-800">⭐ Được đề xuất</AppText>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
                >
                    {featuredCourses.map(course => (
                        <View key={course.id} className="mx-2">
                            <CourseCard course={course} width={200} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
};

export default HighlightsScreen;
