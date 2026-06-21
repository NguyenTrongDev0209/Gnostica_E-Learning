import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Ticket, Plus, Tag, Clock } from 'lucide-react-native';

const mockCoupons = [
    { id: 1, code: 'REACT_2026', discount: '30%', usage: '15/50', expiry: '31/12/2026', status: 'active' },
    { id: 2, code: 'NODE_JS_PRO', discount: '50%', usage: '100/100', expiry: '15/06/2026', status: 'expired' },
];

export default function InstructorCouponsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center justify-between border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <ArrowLeft size={24} color="#334155" />
                    </TouchableOpacity>
                    <AppText className="text-[18px] font-extrabold text-slate-800">Quản lý mã giảm giá</AppText>
                </View>
                <TouchableOpacity className="bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center">
                    <Plus size={16} color="#2563EB" />
                    <AppText className="text-blue-600 font-bold text-xs ml-1">Tạo mới</AppText>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {mockCoupons.map(coupon => (
                    <View key={coupon.id} className="bg-white p-4 rounded-2xl mb-4 border border-slate-100 shadow-sm flex-row items-center">
                        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${coupon.status === 'active' ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                            <Ticket size={24} color={coupon.status === 'active' ? '#10B981' : '#94A3B8'} />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-1">
                                <AppText className="text-base font-bold text-slate-800">{coupon.code}</AppText>
                                <View className={`px-2 py-0.5 rounded-full ${coupon.status === 'active' ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                                    <AppText className={`text-[10px] font-bold ${coupon.status === 'active' ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {coupon.status === 'active' ? 'Đang kích hoạt' : 'Hết hạn'}
                                    </AppText>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-4">
                                <View className="flex-row items-center gap-1">
                                    <Tag size={12} color="#64748B" />
                                    <AppText className="text-xs text-slate-500 font-medium">Giảm {coupon.discount}</AppText>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Clock size={12} color="#64748B" />
                                    <AppText className="text-xs text-slate-500 font-medium">HSD: {coupon.expiry}</AppText>
                                </View>
                            </View>
                            <AppText className="text-[11px] text-slate-400 mt-2">Đã dùng: {coupon.usage}</AppText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
