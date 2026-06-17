import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Flame, TrendingUp, Award, Star, Users, ChevronRight } from 'lucide-react-native';
import CourseCard from '../../components/home/CourseCard';
import { courses, featuredCourses } from '../../constants/mockData';

const STATS = [
    { label: 'Khóa học', value: '200+', icon: Award, color: '#3B82F6' },
    { label: 'Học viên', value: '50K+', icon: Users, color: '#10B981' },
    { label: 'Đánh giá', value: '4.8',  icon: Star,  color: '#F59E0B' },
];

const HighlightsScreen = () => {
    const navigation = useNavigation();

    const topCourses = [...courses].sort((a, b) => (b.studentCount || 0) - (a.studentCount || 0)).slice(0, 3);

    return (
        <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
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
                        <Text className="text-white text-2xl font-extrabold ml-2">Nổi bật</Text>
                    </View>
                    <Text className="text-white/80 text-sm leading-5">
                        Khám phá những khóa học được yêu thích nhất và trending trên Gnostica.
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row mt-5 gap-3">
                        {STATS.map(stat => (
                            <View key={stat.label} className="flex-1 bg-white/15 rounded-2xl py-3 items-center">
                                <stat.icon size={18} color="#fff" />
                                <Text className="text-white font-extrabold text-lg mt-1">{stat.value}</Text>
                                <Text className="text-white/60 text-[10px] font-medium">{stat.label}</Text>
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
                        <Text className="text-lg font-extrabold text-slate-800">Trending ngay bây giờ</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('CourseCatalog')}>
                        <Text className="text-sm text-blue-600 font-semibold">Xem tất cả</Text>
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
                            <Text className="font-extrabold text-sm"
                                style={{ color: index === 0 ? '#B45309' : index === 1 ? '#475569' : '#C2410C' }}
                            >
                                {index + 1}
                            </Text>
                        </View>

                        <Image
                            source={{ uri: course.thumbnail }}
                            className="w-14 h-14 rounded-xl bg-slate-200"
                        />

                        <View className="flex-1 ml-3">
                            <Text className="text-[13px] font-bold text-slate-800" numberOfLines={1}>
                                {course.title}
                            </Text>
                            <Text className="text-xs text-slate-400 mt-0.5">{course.instructor}</Text>
                            <View className="flex-row items-center mt-1 gap-2">
                                <View className="flex-row items-center">
                                    <Star size={10} color="#F59E0B" fill="#F59E0B" />
                                    <Text className="text-[10px] text-slate-500 font-medium ml-0.5">{course.rating}</Text>
                                </View>
                                <Text className="text-[10px] text-slate-300">•</Text>
                                <Text className="text-[10px] text-slate-400">{course.studentCount?.toLocaleString()} học viên</Text>
                            </View>
                        </View>

                        <Text className="text-sm font-extrabold text-blue-600">{course.price}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Featured Courses Horizontal */}
            <View className="mt-6">
                <View className="flex-row items-center justify-between px-5 mb-4">
                    <Text className="text-lg font-extrabold text-slate-800">⭐ Được đề xuất</Text>
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

            {/* CTA Banner */}
            <View className="mx-5 mt-6 mb-24 bg-slate-900 rounded-2xl p-5 flex-row items-center">
                <View className="flex-1 pr-4">
                    <Text className="text-white font-bold text-base mb-1">Bạn là giảng viên?</Text>
                    <Text className="text-slate-400 text-xs leading-4">
                        Chia sẻ kiến thức và tạo thu nhập cùng Gnostica.
                    </Text>
                </View>
                <TouchableOpacity
                    className="bg-white px-4 py-2.5 rounded-xl"
                    onPress={() => navigation.navigate('InstructorDashboard')}
                >
                    <Text className="text-slate-900 font-bold text-xs">Tìm hiểu</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default HighlightsScreen;
