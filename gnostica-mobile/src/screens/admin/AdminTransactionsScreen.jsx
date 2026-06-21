import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, RefreshCw, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';

export default function AdminTransactionsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <AppText className="text-[18px] font-extrabold text-slate-800">Lịch sử giao dịch</AppText>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[
                    { id: 1, type: 'in', amount: '+1,500,000đ', user: 'Lê Văn C', method: 'PayOS', status: 'Thành công' },
                    { id: 2, type: 'out', amount: '-500,000đ', user: 'Giảng viên B', method: 'Chuyển khoản', status: 'Đang xử lý' }
                ].map((item) => (
                    <View key={item.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.type === 'in' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            {item.type === 'in' ? <ArrowDownLeft size={20} color="#10B981" /> : <ArrowUpRight size={20} color="#EF4444" />}
                        </View>
                        <View className="flex-1">
                            <AppText className={`text-sm font-black ${item.type === 'in' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {item.amount}
                            </AppText>
                            <AppText className="text-xs text-slate-500 mt-0.5">{item.user} • {item.method}</AppText>
                        </View>
                        <View className="items-end">
                            <View className={`px-2 py-0.5 rounded-md ${item.status === 'Thành công' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <AppText className={`text-[10px] font-bold ${item.status === 'Thành công' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {item.status}
                                </AppText>
                            </View>
                            <AppText className="text-[10px] text-slate-400 mt-1">10:30, 20/06</AppText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
