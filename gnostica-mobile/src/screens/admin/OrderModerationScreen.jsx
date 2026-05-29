import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, X, Clock, ExternalLink } from 'lucide-react-native';

const MOCK_PENDING_ORDERS = [
    { id: 'ORD-8821', user: 'kha_tran', amount: '450.000đ', time: '5 phút trước', bank: 'Techcombank' },
    { id: 'ORD-8822', user: 'le_huy', amount: '299.000đ', time: '12 phút trước', bank: 'MB Bank' },
    { id: 'ORD-8823', user: 'anh_dao', amount: '150.000đ', time: '25 phút trước', bank: 'VCB' }
];

const OrderModerationScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Duyệt đơn hàng</Text>
                <View className="ml-auto bg-amber-100 px-2 py-1 rounded">
                    <Text className="text-amber-600 text-[10px] font-bold">12 Chờ duyệt</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {MOCK_PENDING_ORDERS.map(order => (
                    <View key={order.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className="text-slate-900 font-bold text-sm">{order.id}</Text>
                                <Text className="text-slate-500 text-xs mt-0.5">Người mua: <Text className="font-bold text-slate-700">{order.user}</Text></Text>
                            </View>
                            <TouchableOpacity className="p-2 bg-slate-50 rounded-full">
                                <ExternalLink size={16} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-between items-center mb-6 bg-slate-50 p-3 rounded-2xl">
                            <View>
                                <Text className="text-slate-400 text-[10px] uppercase font-bold">Số tiền</Text>
                                <Text className="text-slate-900 font-bold text-base">{order.amount}</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-slate-400 text-[10px] uppercase font-bold">Ngân hàng</Text>
                                <Text className="text-slate-700 font-medium text-xs">{order.bank}</Text>
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-red-50 py-3 rounded-xl gap-2">
                                <X size={16} color="#ef4444" />
                                <Text className="text-red-600 font-bold text-sm">Từ chối</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-[2] flex-row items-center justify-center bg-green-600 py-3 rounded-xl gap-2">
                                <Check size={16} color="#fff" />
                                <Text className="text-white font-bold text-sm">Phê duyệt đơn</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center justify-center mt-4">
                            <Clock size={12} color="#94a3b8" />
                            <Text className="text-slate-400 text-[10px] ml-1.5">Gửi lúc {order.time}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default OrderModerationScreen;
