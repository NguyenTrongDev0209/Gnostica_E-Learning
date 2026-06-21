import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, ShieldOff } from 'lucide-react-native';

export default function AdminThreadModerationScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <AppText className="text-[18px] font-extrabold text-slate-800">Kiểm duyệt bài viết</AppText>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-4 border border-amber-200 shadow-sm">
                        <View className="flex-row items-center justify-between mb-2">
                            <AppText className="text-xs font-bold text-amber-600">Chờ duyệt</AppText>
                            <AppText className="text-[10px] text-slate-400">Tác giả: Nam Nguyễn</AppText>
                        </View>
                        
                        <AppText className="text-base font-bold text-slate-800 mb-1">Cách tối ưu render trong React Native?</AppText>
                        <AppText className="text-sm text-slate-600 mb-4" numberOfLines={3}>
                            Chào mọi người, app của mình đang gặp tình trạng giật lag khi danh sách có nhiều item. Mình dùng FlatList nhưng vẫn bị...
                        </AppText>

                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 bg-red-50 py-2.5 rounded-xl flex-row items-center justify-center">
                                <ShieldOff size={16} color="#EF4444" />
                                <AppText className="text-red-500 font-bold text-xs ml-1.5">Từ chối</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 bg-emerald-500 py-2.5 rounded-xl flex-row items-center justify-center">
                                <CheckCircle2 size={16} color="#fff" />
                                <AppText className="text-white font-bold text-xs ml-1.5">Phê duyệt</AppText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
