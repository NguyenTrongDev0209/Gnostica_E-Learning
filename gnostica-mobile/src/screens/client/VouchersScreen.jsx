import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ticket, Clock } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import couponService from '../../services/couponService';

const VouchersScreen = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                // Call getAll() hoặc getMyCoupons() tuỳ backend hỗ trợ
                const response = await couponService.getAll();
                const data = response.data || response.content || response;
                if (Array.isArray(data)) {
                    setVouchers(data);
                }
            } catch (error) {
                console.error('Error fetching vouchers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVouchers();
    }, []);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Ưu đãi của tôi" />

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
                ) : vouchers.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Ticket size={64} color="#CBD5E1" />
                        <AppText className="text-lg font-bold text-slate-800 mt-4">Chưa có mã giảm giá</AppText>
                    </View>
                ) : (
                    vouchers.map(item => (
                        <View key={item.id} className="bg-white rounded-2xl mb-4 overflow-hidden border border-slate-100 shadow-sm flex-row">
                            <View className="w-4 bg-primary" />
                            <View className="flex-1 p-4">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1 pr-4">
                                        <AppText className="text-slate-900 font-bold text-base">{item.title || item.code}</AppText>
                                        <AppText className="text-slate-500 text-xs mt-1">{item.description || 'Ưu đãi dành cho bạn'}</AppText>
                                    </View>
                                    <View className="bg-blue-50 px-2 py-1 rounded">
                                        <AppText className="text-primary text-[10px] font-bold uppercase">{item.discountType || 'GIẢM GIÁ'}</AppText>
                                    </View>
                                </View>

                                <View className="h-px bg-slate-100 my-3" />

                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center gap-1.5">
                                        <Clock size={12} color="#94a3b8" />
                                        <AppText className="text-slate-400 text-xs">Hết hạn: {item.expiryDate || item.endDate || 'Vô thời hạn'}</AppText>
                                    </View>
                                    <TouchableOpacity className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                        <AppText className="text-primary font-bold text-sm">{item.code}</AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}

                <TouchableOpacity className="mt-4 flex-row items-center justify-center p-4 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Ticket size={20} color="#64748b" />
                    <AppText className="ml-2 text-slate-500 font-medium">Nhập mã ưu đãi khác</AppText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default VouchersScreen;
