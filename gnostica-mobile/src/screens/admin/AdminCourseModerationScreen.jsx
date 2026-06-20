import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Clock, ShieldAlert } from 'lucide-react-native';

export default function AdminCourseModerationScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Duyệt khóa học</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2].map((item) => (
                    <TouchableOpacity 
                        key={item} 
                        className="bg-white p-4 rounded-2xl mb-4 border border-amber-200 shadow-sm"
                        onPress={() => navigation.navigate('AdminCourseDetailModeration')}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="bg-amber-100 px-2 py-1 rounded-md flex-row items-center">
                                <Clock size={12} color="#D97706" />
                                <Text className="text-[10px] font-bold text-amber-700 ml-1">Chờ duyệt</Text>
                            </View>
                            <Text className="text-[10px] text-slate-400">12:30 - Hôm nay</Text>
                        </View>
                        <Text className="text-base font-bold text-slate-800 mb-1">Khóa học Photoshop Cơ bản</Text>
                        <Text className="text-xs text-slate-500 mb-3">Giảng viên: Trần Thị B</Text>
                        
                        <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-50">
                            <View className="flex-row items-center">
                                <ShieldAlert size={14} color="#EF4444" />
                                <Text className="text-xs text-red-500 font-medium ml-1">Chưa kiểm tra</Text>
                            </View>
                            <Text className="text-xs font-bold text-blue-600">Xem chi tiết</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
