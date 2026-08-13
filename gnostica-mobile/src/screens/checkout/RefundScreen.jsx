import AppText from '../../components/ui/AppText';
import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RefreshCcw, ChevronRight, PlusCircle } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import refundService from '../../services/checkout/refundService';

const STATUS_MAP = {
    1: { label: 'Đang chờ duyệt', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    2: { label: 'Đã hoàn tiền', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
    3: { label: 'Bị từ chối', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' }
};

const RefundScreen = () => {
    const navigation = useNavigation();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRefunds = useCallback(async () => {
        setLoading(true);
        try {
            const response = await refundService.getMyRefunds();
            const data = response.data || response;
            if (Array.isArray(data)) {
                setRefunds(data);
            }
        } catch (error) {
            console.error('Error fetching refunds:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRefunds();
        }, [fetchRefunds])
    );

    const formatPrice = (priceNum) => {
        if (!priceNum) return '0 đ';
        return priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader 
                title="Lịch sử hoàn tiền" 
                rightComponent={
                    <TouchableOpacity onPress={() => navigation.navigate('RefundRequestScreen')} className="flex-row items-center">
                        <PlusCircle size={20} color="#2563EB" />
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="flex-1 items-center justify-center mt-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : refunds.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <RefreshCcw size={64} color="#CBD5E1" />
                        <AppText className="text-lg font-bold text-slate-800 mt-4">Chưa có yêu cầu nào</AppText>
                        <AppText className="text-slate-500 text-center mt-2 text-sm px-4">
                            Bạn chưa gửi yêu cầu hoàn tiền nào. Nhấn biểu tượng (+) góc phải để gửi yêu cầu.
                        </AppText>
                    </View>
                ) : (
                    refunds.map(refund => {
                        const statusObj = STATUS_MAP[refund.status] || { label: 'Không rõ', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100' };
                        return (
                            <View
                                key={refund.id}
                                className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
                            >
                                {/* Top: Order ID + Status */}
                                <View className="flex-row justify-between items-center mb-3">
                                    <AppText className="text-xs text-slate-400 font-medium">Đơn: {refund.refundCode ? `HT-${refund.refundCode}` : `#${refund.orderCode}`}</AppText>
                                    <View className={`px-2.5 py-1 rounded-lg ${statusObj.bg} border ${statusObj.border}`}>
                                        <AppText className={`text-[10px] font-bold uppercase ${statusObj.text}`}>
                                            {statusObj.label}
                                        </AppText>
                                    </View>
                                </View>

                                {/* Course Info */}
                                <View className="flex-row items-center mb-2">
                                    <View className="w-12 h-12 rounded-xl bg-slate-200 items-center justify-center">
                                        <RefreshCcw size={20} color="#94A3B8" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <AppText className="text-sm font-bold text-slate-800" numberOfLines={2}>
                                            {refund.courseTitle || 'Khóa học'}
                                        </AppText>
                                        <AppText className="text-sm font-extrabold text-blue-600 mt-1">
                                            {formatPrice(refund.amount)}
                                        </AppText>
                                    </View>
                                </View>
                                
                                <View className="bg-slate-50 p-2 rounded-lg mt-2">
                                    <AppText className="text-xs text-slate-500 italic">
                                        <AppText className="font-bold">Lý do: </AppText>
                                        {refund.reason}
                                    </AppText>
                                </View>

                                {/* Bottom: Date */}
                                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50">
                                    <AppText className="text-xs text-slate-400">{refund.createdAt ? new Date(refund.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}</AppText>
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-10" />
            </ScrollView>
        </View>
    );
};

export default RefundScreen;
