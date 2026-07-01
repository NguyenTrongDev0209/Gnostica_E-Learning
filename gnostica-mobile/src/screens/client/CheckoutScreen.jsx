import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ticket, ChevronRight } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import orderService from '../../services/orderService';
import couponService from '../../services/couponService';
import Button from '../../components/ui/Button';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { course } = route.params || {};
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const parsePrice = (priceStr) => {
        if (!priceStr || priceStr === 'Miễn phí') return 0;
        return parseInt(priceStr.replace(/\D/g, ''));
    };

    const formatPrice = (priceNum) => {
        if (priceNum === 0) return 'Miễn phí';
        return priceNum.toLocaleString('vi-VN') + 'đ';
    };

    const subtotal = course ? parsePrice(course.price) : 0;
    const total = Math.max(0, subtotal - discount);

    const handleApplyVoucher = async () => {
        if (!voucherCode) return;
        try {
            const response = await couponService.validate(voucherCode);
            // Dựa theo response backend, thường là ApiResponse<Coupon> hoặc ném lỗi nếu sai
            const coupon = response.data || response;
            if (coupon) {
                let discountAmount = 0;
                if (coupon.discountType === 'PERCENTAGE' || coupon.discountType === 'PERCENT') {
                    discountAmount = Math.round(subtotal * (coupon.discountValue || coupon.value) / 100);
                } else {
                    discountAmount = coupon.discountValue || coupon.value || 0;
                }
                
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }

                setDiscount(discountAmount);
                setVoucherApplied(true);
                Alert.alert('Thành công', `Đã áp dụng mã giảm giá -${formatPrice(discountAmount)}`);
            } else {
                Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra mã giảm giá:', error);
            Alert.alert('Lỗi', error?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        }
    };

    const handlePay = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await orderService.createPaymentLink({
                courseId: course.id,
                productName: course.title,
                description: 'Thanh toan don hang',
                price: total,
                returnUrl: 'gnostica://payment-result',
                cancelUrl: 'gnostica://payment-cancel'
            });

            if (response.error === 0 && response.data) {
                setDiscount(0);
                setVoucherApplied(false);
                setVoucherCode('');
                navigation.navigate('PaymentQRCode', { paymentData: response.data });
            } else if (response.data && response.data.qrCode) {
                 // Trường hợp response trả thẳng data
                 setDiscount(0);
                 setVoucherApplied(false);
                 setVoucherCode('');
                 navigation.navigate('PaymentQRCode', { paymentData: response.data });
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể tạo đơn hàng PayOS');
            }
        } catch (error) {
            console.error('Lỗi khi tạo payment link:', error);
            Alert.alert('Lỗi mạng', error?.message || 'Không thể kết nối đến server để tạo mã thanh toán.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Thanh toán" />

            {!course ? (
                <View className="flex-1 items-center justify-center p-5">
                    <AppText className="text-5xl mb-4">🛒</AppText>
                    <AppText className="text-lg font-bold text-slate-800 mb-2">Không có gì để thanh toán</AppText>
                    <AppText className="text-sm text-slate-500 text-center mb-8">Hãy chọn một khóa học để mua ngay.</AppText>
                    <Button variant="primary" onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
                        Khám phá khóa học
                    </Button>
                </View>
            ) : (
                <>
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {/* Course Item */}
                        <View className="p-4">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Khóa học đã chọn
                            </AppText>
                            <View className="flex-row bg-white rounded-2xl p-3 mb-3 border border-slate-100 shadow-sm">
                                <Image
                                    source={{ uri: course.thumbnail }}
                                    className="w-[72px] h-[72px] rounded-xl bg-slate-200"
                                />
                                <View className="flex-1 ml-3 justify-between">
                                    <AppText className="text-[13px] font-bold text-slate-800" numberOfLines={2}>
                                        {course.title}
                                    </AppText>
                                    <View className="flex-row justify-between items-center">
                                        <AppText className="text-sm font-extrabold text-blue-600">{course.price}</AppText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Voucher Section */}
                        <View className="px-4 mb-4">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Mã giảm giá
                            </AppText>
                            <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <View className="flex-row items-center gap-2">
                                    <View className="flex-1 flex-row items-center bg-slate-50 rounded-xl px-3 h-[46px] border border-slate-200">
                                        <Ticket size={18} color="#64748b" />
                                        <TextInput
                                            placeholder="Nhập mã giảm giá..."
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 ml-2 text-sm text-slate-800 p-0 m-0"
                                            value={voucherCode}
                                            onChangeText={setVoucherCode}
                                            autoCapitalize="characters"
                                            editable={!voucherApplied}
                                        />
                                    </View>
                                    <Button
                                        variant={voucherApplied ? 'secondary' : 'primary'}
                                        className="px-4 h-[46px] py-0 rounded-xl"
                                        textClassName="text-sm"
                                        onPress={voucherApplied ? () => { setDiscount(0); setVoucherApplied(false); setVoucherCode(''); } : handleApplyVoucher}
                                        disabled={!voucherCode && !voucherApplied}
                                    >
                                        {voucherApplied ? 'Hủy' : 'Áp dụng'}
                                    </Button>
                                </View>
                                {voucherApplied && (
                                    <View className="flex-row items-center mt-3 bg-green-50 p-2.5 rounded-xl">
                                        <AppText className="text-green-700 text-xs font-semibold">
                                            ✓ Đã áp dụng mã {voucherCode.toUpperCase()} — Giảm {formatPrice(discount)}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Order Summary */}
                        <View className="px-4 mb-6">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Tóm tắt đơn hàng
                            </AppText>
                            <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <View className="flex-row justify-between mb-3">
                                    <AppText className="text-sm text-slate-500">Tạm tính (1 khóa học)</AppText>
                                    <AppText className="text-sm font-semibold text-slate-700">{formatPrice(subtotal)}</AppText>
                                </View>
                                {discount > 0 && (
                                    <View className="flex-row justify-between mb-3">
                                        <AppText className="text-sm text-green-600">Giảm giá</AppText>
                                        <AppText className="text-sm font-semibold text-green-600">-{formatPrice(discount)}</AppText>
                                    </View>
                                )}
                                <View className="h-px bg-slate-100 my-2" />
                                <View className="flex-row justify-between mt-2">
                                    <AppText className="text-base font-bold text-slate-800">Tổng cộng</AppText>
                                    <AppText className="text-xl font-extrabold text-blue-600">{formatPrice(total)}</AppText>
                                </View>
                            </View>
                        </View>

                        <View className="h-6" />
                    </ScrollView>

                    {/* Pay Button */}
                    <View className="bg-white px-5 py-4 pb-8 border-t border-slate-100">
                        <Button
                            variant="primary"
                            className="py-4 rounded-xl"
                            textClassName="text-base font-bold"
                            onPress={handlePay}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang tạo thanh toán...' : `Thanh toán ${formatPrice(total)}`}
                        </Button>
                    </View>
                </>
            )}
        </View>
    );
};

export default CheckoutScreen;
