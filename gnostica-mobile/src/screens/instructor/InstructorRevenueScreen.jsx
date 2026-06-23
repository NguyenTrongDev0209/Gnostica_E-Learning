import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Wallet, TrendingUp, Download, Clock } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


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
            <AppHeader title="Doanh thu & Rút tiền" />

            <ScrollView className="flex-1 p-4">
                {/* Balance Card */}
                <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-lg">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <AppText className="text-blue-100 text-xs font-medium uppercase tracking-wider">Số dư hiện tại</AppText>
                            <AppText className="text-white text-3xl font-bold mt-1">4.850.000đ</AppText>
                        </View>
                        <View className="bg-white/20 p-2 rounded-xl">
                            <Wallet size={24} color="#fff" />
                        </View>
                    </View>
                    <TouchableOpacity className="bg-white py-3 rounded-2xl items-center">
                        <AppText className="text-blue-600 font-bold">Rút tiền ngay</AppText>
                    </TouchableOpacity>
                </View>

                {/* Month Stats */}
                <View className="bg-white rounded-3xl p-5 mb-6 border border-slate-100 shadow-sm flex-row justify-between">
                    <View>
                        <AppText className="text-slate-400 text-[10px] font-bold uppercase">Tháng này</AppText>
                        <AppText className="text-slate-900 font-bold text-lg mt-1">+3,450K</AppText>
                        <View className="flex-row items-center mt-1">
                            <TrendingUp size={12} color="#10b981" />
                            <AppText className="text-green-600 text-[10px] font-bold ml-1">12% vs tháng trước</AppText>
                        </View>
                    </View>
                    <View className="w-px bg-slate-100" />
                    <View>
                        <AppText className="text-slate-400 text-[10px] font-bold uppercase">Học viên mới</AppText>
                        <AppText className="text-slate-900 font-bold text-lg mt-1">+82</AppText>
                        <AppText className="text-slate-400 text-[10px] mt-1 font-medium">Đang tăng trưởng</AppText>
                    </View>
                </View>

                {/* History */}
                <AppText className="text-slate-800 font-bold text-base mb-4">Lịch sử giao dịch</AppText>
                {MOCK_TRANSACTIONS.map(tx => (
                    <View key={tx.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${tx.status === 'Pending' ? 'bg-amber-100' : 'bg-green-100'}`}>
                            {tx.status === 'Pending' ? <Clock size={18} color="#f59e0b" /> : <TrendingUp size={18} color="#10b981" />}
                        </View>
                        <View className="ml-4 flex-1">
                            <AppText className="text-slate-900 font-bold text-sm">{tx.course}</AppText>
                            <AppText className="text-slate-400 text-[10px] mt-0.5">{tx.date}</AppText>
                        </View>
                        <View className="items-end">
                            <AppText className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>{tx.amount}</AppText>
                            <AppText className={`text-[10px] mt-0.5 ${tx.status === 'Pending' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>{tx.status}</AppText>
                        </View>
                    </View>
                ))}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default InstructorRevenueScreen;
