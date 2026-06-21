import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Package, ChevronRight } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import { myCourses } from '../../constants/mockData';

const STATUS_MAP = {
    completed: { label: 'Hoàn thành', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    active:    { label: 'Đang học',   bg: 'bg-blue-50',  text: 'text-blue-700',  border: 'border-blue-100' },
    pending:   { label: 'Chờ xử lý', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
};

const MOCK_ORDERS = myCourses.map((course, i) => ({
    ...course,
    orderId: `GN-${8890 + i}`,
    orderDate: `${15 + i}/05/2026`,
    status: course.completed ? 'completed' : 'active',
}));

const OrdersScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader 
                title="Đơn hàng của tôi" 
                rightComponent={<AppText className="text-slate-400 text-sm">{MOCK_ORDERS.length} đơn</AppText>}
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {MOCK_ORDERS.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Package size={64} color="#CBD5E1" />
                        <AppText className="text-lg font-bold text-slate-800 mt-4">Chưa có đơn hàng</AppText>
                        <AppText className="text-slate-500 text-center mt-2 text-sm">
                            Khi bạn mua khóa học, đơn hàng sẽ xuất hiện ở đây.
                        </AppText>
                    </View>
                ) : (
                    MOCK_ORDERS.map(order => {
                        const status = STATUS_MAP[order.status];
                        return (
                            <TouchableOpacity
                                key={order.id}
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                                onPress={() => navigation.navigate('CourseDetail', { course: order })}
                                activeOpacity={0.8}
                            >
                                {/* Top: Order ID + Status */}
                                <View className="flex-row justify-between items-center mb-3">
                                    <AppText className="text-xs text-slate-400 font-medium">#{order.orderId}</AppText>
                                    <View className={`px-2.5 py-1 rounded-lg ${status.bg} border ${status.border}`}>
                                        <AppText className={`text-[10px] font-bold uppercase ${status.text}`}>
                                            {status.label}
                                        </AppText>
                                    </View>
                                </View>

                                {/* Course Info */}
                                <View className="flex-row items-center">
                                    <Image
                                        source={{ uri: order.thumbnail }}
                                        className="w-14 h-14 rounded-xl bg-slate-200"
                                    />
                                    <View className="flex-1 ml-3">
                                        <AppText className="text-sm font-bold text-slate-800" numberOfLines={2}>
                                            {order.title}
                                        </AppText>
                                        <AppText className="text-xs text-slate-400 mt-1">
                                            {order.instructor}
                                        </AppText>
                                    </View>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </View>

                                {/* Bottom: Date + Price */}
                                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                    <AppText className="text-xs text-slate-400">{order.orderDate}</AppText>
                                    <AppText className="text-sm font-extrabold text-blue-600">{order.price}</AppText>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default OrdersScreen;
