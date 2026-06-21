import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Flag, ShieldAlert, Check } from 'lucide-react-native';

export default function AdminReportsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <AppText className="text-[18px] font-extrabold text-slate-800">Xử lý báo cáo</AppText>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-4 border border-red-100 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                <Flag size={14} color="#EF4444" />
                                <AppText className="text-xs font-bold text-red-500 ml-1">Báo cáo khóa học</AppText>
                            </View>
                            <AppText className="text-[10px] text-slate-400">10:00 - Hôm qua</AppText>
                        </View>
                        
                        <AppText className="text-sm font-bold text-slate-800 mb-1">Khóa học Lập trình C++</AppText>
                        <AppText className="text-sm text-slate-600 mb-3">Người dùng phản ánh khóa học chứa nội dung không phù hợp.</AppText>

                        <View className="flex-row gap-2">
                            <TouchableOpacity className="flex-1 bg-slate-100 py-2 rounded-lg items-center">
                                <AppText className="text-slate-600 font-bold text-xs">Bỏ qua</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-red-500 py-2 rounded-lg flex-row items-center justify-center">
                                <ShieldAlert size={14} color="#fff" />
                                <AppText className="text-white font-bold text-xs ml-1">Cảnh cáo</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
