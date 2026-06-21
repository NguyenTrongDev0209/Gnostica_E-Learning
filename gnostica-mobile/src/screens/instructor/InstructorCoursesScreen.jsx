import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Plus, Edit2, BarChart2, MoreVertical } from 'lucide-react-native';

const MOCK_COURSES = [
    {
        id: '1',
        title: 'Lập trình React Native thực chiến',
        students: 450,
        status: 'Published',
        revenue: '12Mđ',
        image: 'https://img.freepik.com/free-vector/app-development-concept-with-programming-languages_23-2148703831.jpg'
    },
    {
        id: '2',
        title: 'UI/UX Design for Mobile Apps',
        students: 210,
        status: 'Draft',
        revenue: '0đ',
        image: 'https://img.freepik.com/free-vector/user-interface-design-concept-illustration_114360-1202.jpg'
    }
];

const InstructorCoursesScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <ArrowLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <AppText className="text-xl font-bold text-slate-800 ml-2">Khóa học của tôi</AppText>
                </View>
                <TouchableOpacity className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center">
                    <Plus size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {MOCK_COURSES.map(course => (
                    <View key={course.id} className="bg-white rounded-3xl overflow-hidden mb-4 shadow-sm border border-slate-100">
                        <Image source={{ uri: course.image }} className="w-full h-32" />
                        <View className="p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <AppText className="flex-1 text-slate-900 font-bold text-sm mr-4" numberOfLines={1}>
                                    {course.title}
                                </AppText>
                                <View className={`px-2 py-0.5 rounded ${course.status === 'Published' ? 'bg-green-50' : 'bg-slate-100'}`}>
                                    <AppText className={`text-[10px] font-bold ${course.status === 'Published' ? 'text-green-600' : 'text-slate-500'}`}>
                                        {course.status}
                                    </AppText>
                                </View>
                            </View>

                            <View className="flex-row gap-6 mb-4">
                                <View>
                                    <AppText className="text-slate-400 text-[10px]">Học viên</AppText>
                                    <AppText className="text-slate-900 font-bold text-xs">{course.students}</AppText>
                                </View>
                                <View>
                                    <AppText className="text-slate-400 text-[10px]">Doanh thu</AppText>
                                    <AppText className="text-slate-900 font-bold text-xs">{course.revenue}</AppText>
                                </View>
                            </View>

                            <View className="flex-row gap-2">
                                <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-slate-900 py-3 rounded-xl gap-2">
                                    <Edit2 size={14} color="#fff" />
                                    <AppText className="text-white font-bold text-xs">Chỉnh sửa</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity className="w-12 items-center justify-center bg-blue-50 rounded-xl">
                                    <BarChart2 size={18} color="#2563eb" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default InstructorCoursesScreen;
