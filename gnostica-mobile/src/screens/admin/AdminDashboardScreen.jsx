import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users, ShoppingBag, BookOpen, AlertCircle, TrendingUp, ChevronRight, Settings } from 'lucide-react-native';

const AdminDashboardScreen = () => {
    const navigation = useNavigation();

    const stats = [
        { label: 'Doanh thu tháng', value: '150.2Mđ', icon: TrendingUp, color: '#10b981' },
        { label: 'Người dùng mới', value: '450', icon: Users, color: '#3b82f6' },
        { label: 'Đơn hàng mới', value: '28', icon: ShoppingBag, color: '#f59e0b' },
        { label: 'Cần duyệt', value: '12', icon: AlertCircle, color: '#ef4444' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-slate-900 pt-12 pb-6 px-4 border-b border-slate-800 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                        <ArrowLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white ml-2">Quản trị viên</Text>
                </View>
                <TouchableOpacity className="p-2 bg-slate-800 rounded-full">
                    <Settings size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    {stats.map((stat, i) => (
                        <View key={i} className="w-[48%] bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100">
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                style={{ backgroundColor: stat.color + '15' }}
                            >
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</Text>
                            <Text className="text-slate-900 font-bold text-lg mt-1">{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* System Management */}
                <Text className="text-slate-800 font-bold text-base mb-4">Quản lý hệ thống</Text>

                {[
                    { label: 'Quản lý người dùng', icon: Users, target: 'UserManagement', desc: '4,500 người dùng hoạt động' },
                    { label: 'Duyệt đơn hàng', icon: ShoppingBag, target: 'OrderModeration', desc: '12 đơn hàng đang chờ duyệt' },
                    { label: 'Kiểm duyệt khóa học', icon: BookOpen, target: 'AdminDashboard', desc: '3 khóa học mới cần kiểm tra' },
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100 flex-row items-center"
                        onPress={() => navigation.navigate(item.target)}
                    >
                        <View className="w-12 h-12 bg-slate-50 rounded-xl items-center justify-center">
                            <item.icon size={22} color="#475569" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-slate-900 font-bold text-sm">{item.label}</Text>
                            <Text className="text-slate-400 text-xs mt-0.5">{item.desc}</Text>
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                ))}

                {/* Real-time Logs Placeholder */}
                <View className="bg-white p-5 rounded-3xl mt-4 mb-10 shadow-sm border border-slate-100">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-slate-800 font-bold text-base">Hoạt động gần đây</Text>
                        <TouchableOpacity><Text className="text-blue-600 text-xs font-bold">Xem tất cả</Text></TouchableOpacity>
                    </View>

                    {[
                        { text: 'Người dùng kha_tran vừa mua khóa học React', time: '2 phút trước' },
                        { text: 'Giảng viên Hoang_Long cập nhật bài giảng mới', time: '15 phút trước' },
                        { text: 'Hệ thống vừa backup dữ liệu thành công', time: '1 giờ trước' },
                    ].map((log, i) => (
                        <View key={i} className="flex-row items-start mb-4 gap-3">
                            <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                            <View className="flex-1">
                                <Text className="text-slate-700 text-xs leading-5">{log.text}</Text>
                                <Text className="text-slate-400 text-[10px] mt-0.5">{log.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default AdminDashboardScreen;
