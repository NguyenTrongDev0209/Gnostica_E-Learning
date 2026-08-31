import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ticket, ChevronRight, QrCode, Wallet } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import orderService from '../../services/checkout/orderService';
import couponService from '../../services/checkout/couponService';
import walletService from '../../services/checkout/walletService';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { isDarkMode } = useTheme();
    const { course } = route.params || {};
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [voucherApplied, setVoucherApplied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [paymentMethod, setPaymentMethod] = useState('PAYOS');
    const [walletBalance, setWalletBalance] = useState(0);
    const [isWalletLoading, setIsWalletLoading] = useState(true);

    React.useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await walletService.getMyWallet();
                if (response && response.remain != null) {
                    setWalletBalance(response.remain);
                }
            } catch (error) {
                console.error('Lỗi khi tải ví:', error);
                setWalletBalance(0);
            } finally {
                setIsWalletLoading(false);
            }
        };
        fetchWallet();
    }, []);

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

    // Đơn 0đ (miễn phí/coupon 100%): chỉ dùng Ví, disable PayOS
    React.useEffect(() => {
        if (total === 0 && paymentMethod !== 'WALLET') {
            setPaymentMethod('WALLET');
        }
    }, [total, paymentMethod]);

    const handleApplyVoucher = async () => {
        if (!voucherCode) return;
        try {
            const response = await couponService.validate(voucherCode);
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
                couponCode: voucherApplied ? voucherCode : null,
                paymentMethod: paymentMethod,
                returnUrl: 'gnostica://payment-result',
                cancelUrl: 'gnostica://payment-cancel'
            });

            if (response.error === 0 && response.data) {
                setDiscount(0);
                setVoucherApplied(false);
                setVoucherCode('');
                if (response.data.status === 'PAID') {
                    Alert.alert('Thành công', 'Thanh toán bằng Ví Gnostica thành công!');
                    navigation.navigate('Main', { screen: 'Home' });
                } else {
                    navigation.navigate('PaymentQRCode', { paymentData: response.data });
                }
            } else if (response.data && response.data.qrCode) {
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
        <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {/* Header */}
            <AppHeader 
                title="Thanh toán" 
                className={isDarkMode ? '!bg-slate-800 !border-slate-700' : ''}
                titleClassName={isDarkMode ? '!text-slate-100' : ''}
            />

            {!course ? (
                <View className="flex-1 items-center justify-center p-5">
                    <AppText className="text-5xl mb-4">🛒</AppText>
                    <AppText className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Không có gì để thanh toán</AppText>
                    <AppText className={`text-sm text-center mb-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hãy chọn một khóa học để mua ngay.</AppText>
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
                            <View className={`flex-row rounded-2xl p-3 mb-3 border shadow-sm ${
                                isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                            }`}>
                                <Image
                                    source={{ uri: course.thumbnail }}
                                    className={`w-[72px] h-[72px] rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
                                />
                                <View className="flex-1 ml-3 justify-between">
                                    <AppText className={`text-[13px] font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`} numberOfLines={2}>
                                        {course.title}
                                    </AppText>
                                    <View className="flex-row justify-between items-center">
                                        <AppText className="text-sm font-extrabold text-blue-500">{course.price}</AppText>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Voucher Section */}
                        <View className="px-4 mb-4">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Mã giảm giá
                            </AppText>
                            <View className={`rounded-2xl p-4 border shadow-sm ${
                                isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                            }`}>
                                <View className="flex-row items-center gap-2">
                                    <View className={`flex-1 flex-row items-center rounded-xl px-3 h-[46px] border ${
                                        isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        <Ticket size={18} color={isDarkMode ? "#94a3b8" : "#64748b"} />
                                        <TextInput
                                            placeholder="Nhập mã giảm giá..."
                                            placeholderTextColor="#94a3b8"
                                            className={`flex-1 ml-2 text-sm p-0 m-0 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}
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
                                    <View className={`flex-row items-center mt-3 p-2.5 rounded-xl ${isDarkMode ? 'bg-green-950/60' : 'bg-green-50'}`}>
                                        <AppText className="text-green-500 text-xs font-semibold">
                                            ✓ Đã áp dụng mã {voucherCode.toUpperCase()} — Giảm {formatPrice(discount)}
                                        </AppText>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Payment Method */}
                        <View className="px-4 mb-4">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Phương thức thanh toán
                            </AppText>
                            <View className={`rounded-2xl border shadow-sm overflow-hidden ${
                                isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                            }`}>
                                <TouchableOpacity 
                                    disabled={total === 0}
                                    className={`flex-row items-center p-4 border-b ${isDarkMode ? 'border-slate-700/60' : 'border-slate-100'} ${
                                        paymentMethod === 'PAYOS' ? (isDarkMode ? 'bg-blue-950/60' : 'bg-blue-50') : ''
                                    } ${total === 0 ? 'opacity-40' : ''}`}
                                    onPress={() => setPaymentMethod('PAYOS')}
                                >
                                    <QrCode size={24} color={paymentMethod === 'PAYOS' ? '#3b82f6' : (isDarkMode ? '#94a3b8' : '#64748b')} />
                                    <View className="flex-1 ml-3">
                                        <AppText className={`font-bold ${paymentMethod === 'PAYOS' ? 'text-blue-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>PayOS</AppText>
                                        <AppText className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Thanh toán bằng mã QR</AppText>
                                    </View>
                                    {paymentMethod === 'PAYOS' && <View className="w-4 h-4 rounded-full bg-blue-600" />}
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    className={`flex-row items-center p-4 ${paymentMethod === 'WALLET' ? (isDarkMode ? 'bg-blue-950/60' : 'bg-blue-50') : ''}`}
                                    onPress={() => setPaymentMethod('WALLET')}
                                >
                                    <Wallet size={24} color={paymentMethod === 'WALLET' ? '#3b82f6' : (isDarkMode ? '#94a3b8' : '#64748b')} />
                                    <View className="flex-1 ml-3">
                                        <AppText className={`font-bold ${paymentMethod === 'WALLET' ? 'text-blue-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>Ví Gnostica</AppText>
                                        {isWalletLoading ? (
                                            <AppText className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Đang tải số dư...</AppText>
                                        ) : (
                                            <AppText className={`text-xs ${walletBalance < total && paymentMethod === 'WALLET' ? 'text-red-500 font-bold' : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                                                Số dư khả dụng: {formatPrice(walletBalance)}
                                            </AppText>
                                        )}
                                    </View>
                                    {paymentMethod === 'WALLET' && <View className="w-4 h-4 rounded-full bg-blue-600" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Order Summary */}
                        <View className="px-4 mb-6">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Tóm tắt đơn hàng
                            </AppText>
                            <View className={`rounded-2xl p-4 border shadow-sm ${
                                isDarkMode ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-100'
                            }`}>
                                <View className="flex-row justify-between mb-3">
                                    <AppText className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tạm tính (1 khóa học)</AppText>
                                    <AppText className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{formatPrice(subtotal)}</AppText>
                                </View>
                                {discount > 0 && (
                                    <View className="flex-row justify-between mb-3">
                                        <AppText className="text-sm text-green-500">Giảm giá</AppText>
                                        <AppText className="text-sm font-semibold text-green-500">-{formatPrice(discount)}</AppText>
                                    </View>
                                )}
                                <View className={`h-px my-2 ${isDarkMode ? 'bg-slate-700/60' : 'bg-slate-100'}`} />
                                <View className="flex-row justify-between mt-2">
                                    <AppText className={`text-base font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Tổng cộng</AppText>
                                    <AppText className="text-xl font-extrabold text-blue-500">{formatPrice(total)}</AppText>
                                </View>
                            </View>
                        </View>

                        <View className="h-6" />
                    </ScrollView>

                    {/* Pay Button */}
                    <View className={`px-5 py-4 pb-8 border-t ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                        <Button
                            variant="primary"
                            className="py-4 rounded-xl"
                            textClassName="text-base font-bold"
                            onPress={handlePay}
                            disabled={isLoading || (paymentMethod === 'WALLET' && walletBalance < total)}
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
