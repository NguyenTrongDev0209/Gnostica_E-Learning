import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Package, ChevronRight } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import orderService from '../../services/checkout/orderService';

const STATUS_MAP = {
    1: { label: 'Đã thanh toán', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    0: { label: 'Chờ thanh toán', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    '-1': { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    'PAID': { label: 'Đã thanh toán', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    'PENDING': { label: 'Chờ thanh toán', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    'CANCELLED': { label: 'Đã hủy', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' }
};

const OrdersScreen = () => {
    // const navigation = useNavigation(); // Bỏ đi nếu không có link cụ thể, tránh warning
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await orderService.getAll();
                const data = response.data || response;
                if (Array.isArray(data)) {
                    setOrders(data);
                } else if (data.content) {
                    setOrders(data.content);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatPrice = (priceNum) => {
        if (!priceNum) return '0 đ';
        return priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader 
                title="Đơn hàng của tôi" 
                rightComponent={<AppText className="text-slate-400 text-sm">{orders.length} đơn</AppText>}
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="flex-1 items-center justify-center mt-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : orders.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Package size={64} color="#CBD5E1" />
                        <AppText className="text-lg font-bold text-slate-800 mt-4">Chưa có đơn hàng</AppText>
                        <AppText className="text-slate-500 text-center mt-2 text-sm">
                            Khi bạn mua khóa học, đơn hàng sẽ xuất hiện ở đây.
                        </AppText>
                    </View>
                ) : (
                    orders.map(order => {
                        const statusObj = STATUS_MAP[order.status] || { label: 'Không rõ', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' };
                        return (
                            <TouchableOpacity
                                key={order.id || order.orderCode}
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                                activeOpacity={0.8}
                            >
                                {/* Top: Order ID + Status */}
                                <View className="flex-row justify-between items-center mb-3">
                                    <AppText className="text-xs text-slate-400 font-medium">#{order.orderCode || order.id}</AppText>
                                    <View className={`px-2.5 py-1 rounded-lg ${statusObj.bg} border ${statusObj.border}`}>
                                        <AppText className={`text-[10px] font-bold uppercase ${statusObj.text}`}>
                                            {statusObj.label}
                                        </AppText>
                                    </View>
                                </View>

                                {/* Course Info */}
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 rounded-xl bg-slate-200 items-center justify-center">
                                        <Package size={24} color="#94A3B8" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <AppText className="text-sm font-bold text-slate-800" numberOfLines={2}>
                                            {order.description || order.productName || 'Đơn hàng khóa học'}
                                        </AppText>
                                        <AppText className="text-xs text-slate-400 mt-1">
                                            Gnostica
                                        </AppText>
                                    </View>
                                    <ChevronRight size={16} color="#cbd5e1" />
                                </View>

                                {/* Bottom: Date + Price */}
                                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                    <AppText className="text-xs text-slate-400">{order.createdAt || 'Gần đây'}</AppText>
                                    <AppText className="text-sm font-extrabold text-blue-600">{formatPrice(order.amount || order.price)}</AppText>
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
