import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users, Search, Book } from 'lucide-react-native';

const mockStudents = [
    { id: 1, name: 'Lê Văn C', avatar: 'https://picsum.photos/seed/stu1/100/100', enrolledAt: '12/06/2026', courses: 2, progress: 45 },
    { id: 2, name: 'Phạm Thị D', avatar: 'https://picsum.photos/seed/stu2/100/100', enrolledAt: '10/06/2026', courses: 1, progress: 100 },
];

export default function InstructorStudentsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white border-b border-slate-100">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <ArrowLeft size={24} color="#334155" />
                    </TouchableOpacity>
                    <AppText className="text-[18px] font-extrabold text-slate-800">Danh sách học viên</AppText>
                </View>
                
                {/* Search Bar */}
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-2.5">
                    <Search size={18} color="#94A3B8" />
                    <AppText className="text-slate-400 ml-2 text-sm flex-1">Tìm kiếm học viên...</AppText>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between mb-4">
                    <AppText className="text-sm font-bold text-slate-800">Tổng số: 245 học viên</AppText>
                </View>

                {mockStudents.map(student => (
                    <View key={student.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <Image source={{ uri: student.avatar }} className="w-12 h-12 rounded-full mr-3 bg-slate-200" />
                        <View className="flex-1">
                            <AppText className="text-sm font-bold text-slate-800 mb-1">{student.name}</AppText>
                            <View className="flex-row items-center gap-3">
                                <AppText className="text-[11px] text-slate-500">Tham gia: {student.enrolledAt}</AppText>
                                <View className="flex-row items-center gap-1">
                                    <Book size={10} color="#94A3B8" />
                                    <AppText className="text-[11px] text-slate-500">{student.courses} khóa</AppText>
                                </View>
                            </View>
                        </View>
                        <View className="items-end">
                            <AppText className={`text-sm font-bold ${student.progress === 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
                                {student.progress}%
                            </AppText>
                            <AppText className="text-[10px] text-slate-400">Tiến độ</AppText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
