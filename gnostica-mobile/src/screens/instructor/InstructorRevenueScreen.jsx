import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Wallet, TrendingUp, Download, Clock } from 'lucide-react-native';

const MOCK_TRANSACTIONS = [
    { id: '1', date: '25/05/2026', amount: '+1,200,000đ', course: 'React Native', status: 'Completed' },
    { id: '2', date: '24/05/2026', amount: '+550,000đ', course: 'UI/UX Design', status: 'Completed' },
    { id: '3', date: '22/05/2026', amount: '-2,000,000đ', course: 'Rút tiền về NH', status: 'Pending' }
];

const InstructorRevenueScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <ArrowLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-800 ml-2">Doanh thu & Rút tiền</Text>
                </View>
                <TouchableOpacity>
                    <Download size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Balance Card */}
                <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-lg">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-blue-100 text-xs font-medium uppercase tracking-wider">Số dư hiện tại</Text>
                            <Text className="text-white text-3xl font-bold mt-1">4.850.000đ</Text>
                        </View>
                        <View className="bg-white/20 p-2 rounded-xl">
                            <Wallet size={24} color="#fff" />
                        </View>
                    </View>
                    <TouchableOpacity className="bg-white py-3 rounded-2xl items-center">
                        <Text className="text-blue-600 font-bold">Rút tiền ngay</Text>
                    </TouchableOpacity>
                </View>

                {/* Month Stats */}
                <View className="bg-white rounded-3xl p-5 mb-6 border border-slate-100 shadow-sm flex-row justify-between">
                    <View>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Tháng này</Text>
                        <Text className="text-slate-900 font-bold text-lg mt-1">+3,450K</Text>
                        <View className="flex-row items-center mt-1">
                            <TrendingUp size={12} color="#10b981" />
                            <Text className="text-green-600 text-[10px] font-bold ml-1">12% vs tháng trước</Text>
                        </View>
                    </View>
                    <View className="w-px bg-slate-100" />
                    <View>
                        <Text className="text-slate-400 text-[10px] font-bold uppercase">Học viên mới</Text>
                        <Text className="text-slate-900 font-bold text-lg mt-1">+82</Text>
                        <Text className="text-slate-400 text-[10px] mt-1 font-medium">Đang tăng trưởng</Text>
                    </View>
                </View>

                {/* History */}
                <Text className="text-slate-800 font-bold text-base mb-4">Lịch sử giao dịch</Text>
                {MOCK_TRANSACTIONS.map(tx => (
                    <View key={tx.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${tx.status === 'Pending' ? 'bg-amber-100' : 'bg-green-100'}`}>
                            {tx.status === 'Pending' ? <Clock size={18} color="#f59e0b" /> : <TrendingUp size={18} color="#10b981" />}
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-bold text-sm">{tx.course}</Text>
                            <Text className="text-slate-400 text-[10px] mt-0.5">{tx.date}</Text>
                        </View>
                        <View className="items-end">
                            <Text className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>{tx.amount}</Text>
                            <Text className={`text-[10px] mt-0.5 ${tx.status === 'Pending' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>{tx.status}</Text>
                        </View>
                    </View>
                ))}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default InstructorRevenueScreen;
