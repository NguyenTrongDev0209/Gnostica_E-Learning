import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Settings, Globe, Shield } from 'lucide-react-native';

export default function AdminSettingsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <AppText className="text-[18px] font-extrabold text-slate-800">Cài đặt hệ thống</AppText>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
                        <Globe size={20} color="#64748B" className="mr-3" />
                        <AppText className="text-sm font-bold text-slate-800 flex-1">Cấu hình Website / Tên miền</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
                        <Settings size={20} color="#64748B" className="mr-3" />
                        <AppText className="text-sm font-bold text-slate-800 flex-1">Cài đặt Email & SMS</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4">
                        <Shield size={20} color="#64748B" className="mr-3" />
                        <AppText className="text-sm font-bold text-slate-800 flex-1">Phân quyền quản trị</AppText>
                    </TouchableOpacity>
                </View>

                <AppText className="text-sm font-bold text-slate-500 mb-2 ml-1 uppercase">Bảo trì</AppText>
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
                        <View>
                            <AppText className="text-sm font-bold text-slate-800">Chế độ bảo trì</AppText>
                            <AppText className="text-xs text-slate-500 mt-1">Khóa truy cập từ học viên</AppText>
                        </View>
                        <Switch value={false} />
                    </View>
                    <View className="flex-row items-center justify-between p-4">
                        <View>
                            <AppText className="text-sm font-bold text-slate-800">Tự động duyệt bài viết</AppText>
                            <AppText className="text-xs text-slate-500 mt-1">Bật Auto-approve cho diễn đàn</AppText>
                        </View>
                        <Switch value={true} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
