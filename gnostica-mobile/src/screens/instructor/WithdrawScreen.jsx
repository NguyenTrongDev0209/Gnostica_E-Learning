import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Wallet, Building, CheckCircle2 } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


export default function WithdrawScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Rút tiền" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-sm shadow-blue-200">
                    <View className="flex-row items-center mb-2">
                        <Wallet size={20} color="#fff" />
                        <AppText className="text-white/80 font-medium ml-2">Số dư khả dụng</AppText>
                    </View>
                    <AppText className="text-3xl font-black text-white">12,500,000đ</AppText>
                </View>

                <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <AppText className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Tài khoản nhận tiền</AppText>
                    
                    <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                            <Building size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-sm font-bold text-slate-800">Vietcombank</AppText>
                            <AppText className="text-xs text-slate-500">**** **** 1234 • NGUYEN VAN A</AppText>
                        </View>
                        <CheckCircle2 size={20} color="#10B981" />
                    </View>

                    <TouchableOpacity>
                        <AppText className="text-blue-600 font-bold text-sm text-center">Đổi tài khoản khác</AppText>
                    </TouchableOpacity>
                </View>

                <View className="mb-6">
                    <AppText className="text-sm font-bold text-slate-700 mb-2">Số tiền muốn rút (VND)</AppText>
                    <TextInput 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-800"
                        placeholder="Nhập số tiền..."
                        keyboardType="numeric"
                    />
                    <AppText className="text-xs text-slate-500 mt-2 ml-1">Tối thiểu: 500,000đ</AppText>
                </View>

                <TouchableOpacity 
                    className="bg-blue-600 py-4 rounded-xl items-center shadow-sm shadow-blue-200 mb-10"
                    onPress={() => navigation.goBack()}
                >
                    <AppText className="text-white font-extrabold text-base">Tạo yêu cầu rút tiền</AppText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
