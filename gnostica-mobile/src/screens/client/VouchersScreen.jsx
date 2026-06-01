import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Ticket, Clock, Info } from 'lucide-react-native';

const MOCK_VOUCHERS = [
    {
        id: '1',
        title: 'Giảm 50% cho người mới',
        code: 'WELCOME50',
        expiry: '31/12/2026',
        description: 'Áp dụng cho khóa học đầu tiên tại Gnostica.',
        type: 'Discount'
    },
    {
        id: '2',
        title: 'Ưu đãi hè rực rỡ',
        code: 'HE2026',
        expiry: '30/06/2026',
        description: 'Giảm 100.000đ cho đơn hàng từ 500.000đ.',
        type: 'Fixed'
    }
];

const VouchersScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Ưu đãi của tôi</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {MOCK_VOUCHERS.map(item => (
                    <View key={item.id} className="bg-white rounded-2xl mb-4 overflow-hidden border border-slate-100 shadow-sm flex-row">
                        <View className="w-4 bg-primary" />
                        <View className="flex-1 p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="flex-1 pr-4">
                                    <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
                                    <Text className="text-slate-500 text-xs mt-1">{item.description}</Text>
                                </View>
                                <View className="bg-blue-50 px-2 py-1 rounded">
                                    <Text className="text-primary text-[10px] font-bold uppercase">{item.type}</Text>
                                </View>
                            </View>

                            <View className="h-px bg-slate-100 my-3" />

                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center gap-1.5">
                                    <Clock size={12} color="#94a3b8" />
                                    <Text className="text-slate-400 text-xs">Hết hạn: {item.expiry}</Text>
                                </View>
                                <TouchableOpacity className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                    <Text className="text-primary font-bold text-sm">{item.code}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                <TouchableOpacity className="mt-4 flex-row items-center justify-center p-4 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Ticket size={20} color="#64748b" />
                    <Text className="ml-2 text-slate-500 font-medium">Nhập mã ưu đãi khác</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default VouchersScreen;
