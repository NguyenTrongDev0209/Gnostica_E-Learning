import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Copy, QrCode, ShieldCheck } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import api from '../../services/api';

export default function PaymentQRCodeScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    // Dữ liệu từ API truyền sang, fallback nếu chạy độc lập
    const paymentData = route.params?.paymentData || {
        amount: 1500000,
        orderCode: 'ORD-123456789',
        description: 'Thanh toan don hang',
        qrCode: 'mock-qr-code-data',
        accountName: 'GNOSTICA',
        accountNumber: '123456789'
    };

    const qrUrl = paymentData.qrCode 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentData.qrCode)}`
        : 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=error';

    const formatPrice = (priceNum) => {
        if (!priceNum) return '0 đ';
        return priceNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    React.useEffect(() => {
        let interval;
        if (paymentData.orderCode && paymentData.orderCode !== 'ORD-123456789') {
            interval = setInterval(async () => {
                try {
                    const response = await api.get(`/order/${paymentData.orderCode}`);
                    // response = ApiResponse<Order>, Order có status. 1 là PAID
                    if (response.data && response.data.status === 1) {
                        clearInterval(interval);
                        navigation.replace('PaymentSuccess'); // Replace để không back lại QR
                    }
                } catch (error) {
                    console.log('Polling error:', error);
                }
            }, 3000); // 3 giây
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [paymentData.orderCode]);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Thanh toán QR" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white rounded-3xl p-6 items-center shadow-sm border border-slate-100 mb-6">
                    <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                        <QrCode size={32} color="#2563EB" />
                    </View>
                    <AppText className="text-slate-500 font-medium mb-1">Tổng thanh toán</AppText>
                    <AppText className="text-2xl font-black text-blue-600 mb-6">{formatPrice(paymentData.amount)}</AppText>

                    <View className="p-2 border-2 border-slate-100 rounded-2xl mb-6">
                        <Image source={{ uri: qrUrl }} className="w-48 h-48" />
                    </View>

                    <AppText className="text-sm text-slate-500 text-center px-4 leading-5">
                        Quét mã QR trên bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán.
                    </AppText>
                </View>

                {/* Details */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <AppText className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Thông tin chuyển khoản</AppText>
                    
                    <View className="mb-3">
                        <AppText className="text-xs text-slate-500 mb-1">Mã đơn hàng</AppText>
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-sm font-bold text-slate-800">{paymentData.orderCode}</AppText>
                            <TouchableOpacity className="p-1">
                                <Copy size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View>
                        <AppText className="text-xs text-slate-500 mb-1">Nội dung chuyển khoản</AppText>
                        <View className="flex-row items-center justify-between">
                            <AppText className="text-sm font-bold text-slate-800">{paymentData.description}</AppText>
                            <TouchableOpacity className="p-1">
                                <Copy size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="flex-row items-center justify-center mb-10 gap-2">
                    <ShieldCheck size={16} color="#10B981" />
                    <AppText className="text-xs text-slate-500 font-medium">Giao dịch được bảo mật bởi PayOS</AppText>
                </View>

                <TouchableOpacity 
                    className="bg-blue-600 py-4 rounded-xl items-center mb-10 shadow-sm shadow-blue-200"
                    onPress={() => navigation.navigate('PaymentSuccess')}
                >
                    <AppText className="text-white font-extrabold text-base">Đã thanh toán (Test)</AppText>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
