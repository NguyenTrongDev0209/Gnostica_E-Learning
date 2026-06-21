import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Search, MoreVertical } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


export default function AdminCoursesScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Khóa học" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2, 3].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm flex-row items-start">
                        <View className="w-16 h-16 bg-slate-200 rounded-xl mr-3 items-center justify-center">
                            <BookOpen size={24} color="#94A3B8" />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-sm font-bold text-slate-800 mb-1">Khoá học Lập trình React Native {item}</AppText>
                            <AppText className="text-xs text-slate-500 mb-2">Giảng viên: Nguyễn Văn A</AppText>
                            <View className="flex-row items-center">
                                <View className="bg-emerald-100 px-2 py-0.5 rounded-full mr-2">
                                    <AppText className="text-[10px] font-bold text-emerald-700">Đã xuất bản</AppText>
                                </View>
                                <AppText className="text-[11px] font-bold text-blue-600">1,500,000đ</AppText>
                            </View>
                        </View>
                        <TouchableOpacity className="p-1">
                            <MoreVertical size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
