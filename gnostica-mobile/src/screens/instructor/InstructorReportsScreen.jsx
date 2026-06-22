import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, MessageCircle, Star } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


const mockReports = [
    { id: 1, type: 'review', user: 'Lê Văn C', content: 'Khóa học rất hay và dễ hiểu!', date: 'Hôm nay', rating: 5 },
    { id: 2, type: 'report', user: 'Hệ thống', content: 'Cảnh báo: Video bài 3 bị lỗi định dạng.', date: 'Hôm qua' },
];

export default function InstructorReportsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Báo cáo" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {mockReports.map(item => (
                    <View key={item.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 mt-1 ${item.type === 'report' ? 'bg-red-50' : 'bg-amber-50'}`}>
                            {item.type === 'report' ? <AlertTriangle size={20} color="#EF4444" /> : <Star size={20} color="#F59E0B" fill="#F59E0B" />}
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-1">
                                <AppText className="text-sm font-bold text-slate-800">{item.user}</AppText>
                                <AppText className="text-[10px] text-slate-400">{item.date}</AppText>
                            </View>
                            {item.rating && (
                                <View className="flex-row mb-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={10} color={star <= item.rating ? "#F59E0B" : "#CBD5E1"} fill={star <= item.rating ? "#F59E0B" : "transparent"} />
                                    ))}
                                </View>
                            )}
                            <AppText className="text-sm text-slate-600 leading-5">{item.content}</AppText>
                            
                            {item.type === 'review' && (
                                <TouchableOpacity className="flex-row items-center mt-3 pt-3 border-t border-slate-50">
                                    <MessageCircle size={14} color="#2563EB" />
                                    <AppText className="text-xs font-bold text-blue-600 ml-1.5">Phản hồi</AppText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
