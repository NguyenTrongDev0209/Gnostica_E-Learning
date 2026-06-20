import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, BookOpen, Search, MoreVertical } from 'lucide-react-native';

export default function AdminCoursesScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white border-b border-slate-100">
                <View className="flex-row items-center mb-4 justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                            <ArrowLeft size={24} color="#334155" />
                        </TouchableOpacity>
                        <Text className="text-[18px] font-extrabold text-slate-800">Quản lý khóa học</Text>
                    </View>
                </View>
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-2.5">
                    <Search size={18} color="#94A3B8" />
                    <Text className="text-slate-400 ml-2 text-sm flex-1">Tìm kiếm khóa học...</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2, 3].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm flex-row items-start">
                        <View className="w-16 h-16 bg-slate-200 rounded-xl mr-3 items-center justify-center">
                            <BookOpen size={24} color="#94A3B8" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-slate-800 mb-1">Khoá học Lập trình React Native {item}</Text>
                            <Text className="text-xs text-slate-500 mb-2">Giảng viên: Nguyễn Văn A</Text>
                            <View className="flex-row items-center">
                                <View className="bg-emerald-100 px-2 py-0.5 rounded-full mr-2">
                                    <Text className="text-[10px] font-bold text-emerald-700">Đã xuất bản</Text>
                                </View>
                                <Text className="text-[11px] font-bold text-blue-600">1,500,000đ</Text>
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
