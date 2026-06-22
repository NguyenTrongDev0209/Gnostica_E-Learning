import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Bell, Shield, Wallet } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


export default function InstructorSettingsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Cài đặt giảng viên" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
                        <User size={20} color="#64748B" className="mr-3" />
                        <AppText className="text-sm font-bold text-slate-800 flex-1">Hồ sơ chuyên môn</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
                        <Wallet size={20} color="#64748B" className="mr-3" />
                        <AppText className="text-sm font-bold text-slate-800 flex-1">Thông tin thanh toán</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4">
                        <Shield size={20} color="#64748B" className="mr-3" />
                        <AppText className="text-sm font-bold text-slate-800 flex-1">Bảo mật tài khoản</AppText>
                    </TouchableOpacity>
                </View>

                <AppText className="text-sm font-bold text-slate-500 mb-2 ml-1 uppercase">Thông báo</AppText>
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
                        <View className="flex-row items-center">
                            <Bell size={20} color="#64748B" className="mr-3" />
                            <AppText className="text-sm font-bold text-slate-800">Khi có học viên mới</AppText>
                        </View>
                        <Switch value={true} />
                    </View>
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <Bell size={20} color="#64748B" className="mr-3" />
                            <AppText className="text-sm font-bold text-slate-800">Có câu hỏi Q&A mới</AppText>
                        </View>
                        <Switch value={true} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
