import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, Plus, Edit2 } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


export default function AdminForumCategoryScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Chủ đề diễn đàn" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {['Thảo luận chung', 'Hỏi đáp lập trình', 'Tuyển dụng', 'Góc thư giãn'].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-3">
                            <MessageSquare size={20} color="#4F46E5" />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-sm font-bold text-slate-800">{item}</AppText>
                            <AppText className="text-[11px] text-slate-400">1,250 bài viết</AppText>
                        </View>
                        <TouchableOpacity className="p-2 bg-slate-50 rounded-lg">
                            <Edit2 size={16} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
