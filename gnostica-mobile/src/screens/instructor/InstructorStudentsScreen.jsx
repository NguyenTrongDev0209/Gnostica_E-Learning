import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, Search, Book } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


const mockStudents = [
    { id: 1, name: 'Lê Văn C', avatar: 'https://picsum.photos/seed/stu1/100/100', enrolledAt: '12/06/2026', courses: 2, progress: 45 },
    { id: 2, name: 'Phạm Thị D', avatar: 'https://picsum.photos/seed/stu2/100/100', enrolledAt: '10/06/2026', courses: 1, progress: 100 },
];

export default function InstructorStudentsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Học viên" />

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
