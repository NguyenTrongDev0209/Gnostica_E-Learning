import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Star, Trash2 } from 'lucide-react-native';

export default function AdminReviewsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <AppText className="text-[18px] font-extrabold text-slate-800">Quản lý đánh giá</AppText>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                            <AppText className="text-sm font-bold text-slate-800">Lê Văn C</AppText>
                            <View className="flex-row">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={12} color="#F59E0B" fill="#F59E0B" />
                                ))}
                            </View>
                        </View>
                        
                        <AppText className="text-xs text-slate-500 mb-2">Khóa học: Thiết kế UI/UX cơ bản</AppText>
                        <AppText className="text-sm text-slate-600 mb-3 leading-5">Nội dung khóa học rất tuyệt vời, giảng viên tận tâm. Tuy nhiên video bài 2 hơi nhỏ tiếng.</AppText>

                        <View className="flex-row items-center justify-end border-t border-slate-50 pt-3">
                            <TouchableOpacity className="flex-row items-center">
                                <Trash2 size={14} color="#EF4444" />
                                <AppText className="text-xs font-bold text-red-500 ml-1">Xóa đánh giá</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
