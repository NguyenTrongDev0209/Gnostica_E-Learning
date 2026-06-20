import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, X } from 'lucide-react-native';

export default function AdminCourseDetailModerationScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Chi tiết kiểm duyệt</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
                    <Text className="text-xl font-black text-slate-800 mb-2">Khóa học Photoshop Cơ bản</Text>
                    <Text className="text-sm text-slate-500 mb-4">Trần Thị B • Gửi lúc 12:30 Hôm nay</Text>
                    
                    <Text className="text-sm font-bold text-slate-800 mb-2">Mô tả khóa học:</Text>
                    <Text className="text-sm text-slate-600 leading-5 mb-4">Khóa học này cung cấp các kiến thức nền tảng nhất về phần mềm Photoshop...</Text>

                    <Text className="text-sm font-bold text-slate-800 mb-2">Nội dung đã tải lên:</Text>
                    <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                        <Text className="text-sm font-medium text-slate-700">1. Video giới thiệu (10:20)</Text>
                    </View>
                    <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                        <Text className="text-sm font-medium text-slate-700">2. Bài 1: Làm quen giao diện (25:10)</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3 mb-10">
                    <TouchableOpacity className="flex-1 bg-red-50 border border-red-200 py-3 rounded-xl flex-row items-center justify-center">
                        <X size={18} color="#EF4444" />
                        <Text className="text-red-500 font-bold ml-1">Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-emerald-500 py-3 rounded-xl flex-row items-center justify-center">
                        <Check size={18} color="#fff" />
                        <Text className="text-white font-bold ml-1">Phê duyệt</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
