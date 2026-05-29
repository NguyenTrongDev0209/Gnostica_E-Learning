import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BookOpen, Users, DollarSign, MessageSquare, TrendingUp, ChevronRight } from 'lucide-react-native';

const InstructorDashboardScreen = () => {
    const navigation = useNavigation();

    const stats = [
        { label: 'Tổng doanh thu', value: '12.5Mđ', icon: DollarSign, color: '#10b981' },
        { label: 'Học viên', value: '1,240', icon: Users, color: '#3b82f6' },
        { label: 'Khóa học', value: '8', icon: BookOpen, color: '#8b5cf6' },
        { label: 'Đánh giá', value: '4.8', icon: TrendingUp, color: '#f59e0b' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <ArrowLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-800 ml-2">Bảng điều khiển GD</Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 text-[10px] font-bold uppercase">Giảng viên</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    {stats.map((stat, i) => (
                        <View key={i} className="w-[48%] bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100">
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                style={{ backgroundColor: stat.color + '15' }}
                            >
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <Text className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{stat.label}</Text>
                            <Text className="text-slate-900 font-bold text-lg mt-1">{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text className="text-slate-800 font-bold text-base mb-4">Quản lý nhanh</Text>

                {[
                    { label: 'Khóa học của tôi', icon: BookOpen, target: 'InstructorCourses', desc: 'Quản lý bài giảng và nội dung' },
                    { label: 'Báo cáo doanh thu', icon: DollarSign, target: 'InstructorRevenue', desc: 'Xem chi tiết thu nhập & rút tiền' },
                    { label: 'Hỏi đáp học viên', icon: MessageSquare, target: 'InstructorQA', desc: '4 câu hỏi mới chưa trả lời' },
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100 flex-row items-center"
                        onPress={() => navigation.navigate(item.target)}
                    >
                        <View className="w-12 h-12 bg-slate-50 rounded-xl items-center justify-center">
                            <item.icon size={22} color="#475569" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-bold text-sm">{item.label}</Text>
                            <Text className="text-slate-400 text-xs mt-0.5">{item.desc}</Text>
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                ))}

                {/* Performance Chart Placeholder */}
                <View className="bg-white p-6 rounded-3xl mt-4 mb-10 shadow-sm border border-slate-100">
                    <Text className="text-slate-800 font-bold text-base mb-2">Hiệu suất học tập</Text>
                    <Text className="text-slate-400 text-xs mb-6">Thống kê học viên mới trong 7 ngày qua</Text>

                    <View className="h-40 flex-row items-end justify-between px-2">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <View key={i} className="items-center">
                                <View
                                    className="w-4 bg-blue-500 rounded-t-full"
                                    style={{ height: h + '%' }}
                                />
                                <Text className="text-[8px] text-slate-400 mt-2">T{i + 2}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default InstructorDashboardScreen;
