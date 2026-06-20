import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Bell, Shield, Wallet } from 'lucide-react-native';

export default function InstructorSettingsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Cài đặt giảng viên</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
                        <User size={20} color="#64748B" className="mr-3" />
                        <Text className="text-sm font-bold text-slate-800 flex-1">Hồ sơ chuyên môn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
                        <Wallet size={20} color="#64748B" className="mr-3" />
                        <Text className="text-sm font-bold text-slate-800 flex-1">Thông tin thanh toán</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4">
                        <Shield size={20} color="#64748B" className="mr-3" />
                        <Text className="text-sm font-bold text-slate-800 flex-1">Bảo mật tài khoản</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-sm font-bold text-slate-500 mb-2 ml-1 uppercase">Thông báo</Text>
                <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                    <View className="flex-row items-center justify-between p-4 border-b border-slate-50">
                        <View className="flex-row items-center">
                            <Bell size={20} color="#64748B" className="mr-3" />
                            <Text className="text-sm font-bold text-slate-800">Khi có học viên mới</Text>
                        </View>
                        <Switch value={true} />
                    </View>
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <Bell size={20} color="#64748B" className="mr-3" />
                            <Text className="text-sm font-bold text-slate-800">Có câu hỏi Q&A mới</Text>
                        </View>
                        <Switch value={true} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
