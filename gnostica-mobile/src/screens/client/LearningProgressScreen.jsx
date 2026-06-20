import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BookOpen, Trophy, Clock, Activity, CheckCircle2 } from 'lucide-react-native';

const mockCourses = [
    { id: 1, title: 'React Native Masterclass 2026', progress: 75, completedLessons: 30, totalLessons: 40 },
    { id: 2, title: 'Lập trình Node.js thực chiến', progress: 100, completedLessons: 25, totalLessons: 25 },
];

export default function LearningProgressScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Tiến độ học tập</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Stats row */}
                <View className="flex-row p-5 gap-3">
                    {[
                        { label: 'Đang học', value: '3', icon: BookOpen, color: '#3B82F6', bg: 'bg-blue-50' },
                        { label: 'Hoàn thành', value: '1', icon: Trophy, color: '#10B981', bg: 'bg-emerald-50' },
                        { label: 'Giờ học', value: '42h', icon: Clock, color: '#8B5CF6', bg: 'bg-purple-50' },
                    ].map(stat => (
                        <View key={stat.label} className={`flex-1 ${stat.bg} p-4 rounded-2xl border border-slate-100 items-center`}>
                            <stat.icon size={24} color={stat.color} />
                            <Text className="text-[22px] font-extrabold mt-2 text-slate-800">{stat.value}</Text>
                            <Text className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Course List */}
                <View className="px-5 pb-10">
                    <Text className="text-base font-extrabold text-slate-800 mb-4 flex-row items-center">
                        <Activity size={18} color="#334155" /> Chi tiết khóa học
                    </Text>

                    {mockCourses.map(course => (
                        <View key={course.id} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm">
                            <Text className="text-sm font-bold text-slate-800 mb-3" numberOfLines={2}>{course.title}</Text>
                            <View className="flex-row justify-between mb-1.5 items-end">
                                <Text className="text-xs text-slate-500 font-medium">Tiến độ {course.progress}%</Text>
                                <Text className="text-[10px] text-slate-400">{course.completedLessons}/{course.totalLessons} bài</Text>
                            </View>
                            <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <View 
                                    className={`h-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${course.progress}%` }} 
                                />
                            </View>
                            {course.progress === 100 && (
                                <View className="flex-row items-center mt-3 gap-1">
                                    <CheckCircle2 size={14} color="#10B981" />
                                    <Text className="text-xs font-semibold text-emerald-500">Đã hoàn thành</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
