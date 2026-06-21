import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, LayoutGrid, Plus, MoreVertical } from 'lucide-react-native';

export default function AdminCategoriesScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center justify-between border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <ArrowLeft size={24} color="#334155" />
                    </TouchableOpacity>
                    <AppText className="text-[18px] font-extrabold text-slate-800">Quản lý danh mục</AppText>
                </View>
                <TouchableOpacity className="p-1">
                    <Plus size={24} color="#2563EB" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {['Lập trình', 'Thiết kế', 'Marketing', 'Ngoại ngữ'].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                            <LayoutGrid size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-sm font-bold text-slate-800">{item}</AppText>
                            <AppText className="text-[11px] text-slate-400">12 khóa học</AppText>
                        </View>
                        <TouchableOpacity className="p-2">
                            <MoreVertical size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
