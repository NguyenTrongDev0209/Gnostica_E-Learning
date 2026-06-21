import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2, Ticket, ChevronRight } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';

const CheckoutScreen = () => {
    const navigation = useNavigation();
    const { cartItems, removeFromCart, clearCart } = useCart();
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [voucherApplied, setVoucherApplied] = useState(false);

    const parsePrice = (priceStr) => {
        if (!priceStr || priceStr === 'Miễn phí') return 0;
        return parseInt(priceStr.replace(/\D/g, ''));
    };

    const formatPrice = (priceNum) => {
        if (priceNum === 0) return 'Miễn phí';
        return priceNum.toLocaleString('vi-VN') + 'đ';
    };

    const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price), 0);
    const total = Math.max(0, subtotal - discount);

    const handleApplyVoucher = () => {
        if (voucherCode.toUpperCase() === 'WELCOME50') {
            const discountAmount = Math.round(subtotal * 0.5);
            setDiscount(discountAmount);
            setVoucherApplied(true);
            Alert.alert('Thành công', `Đã áp dụng mã giảm giá -${formatPrice(discountAmount)}`);
        } else if (voucherCode.toUpperCase() === 'HE2026') {
            setDiscount(100000);
            setVoucherApplied(true);
            Alert.alert('Thành công', 'Đã áp dụng mã giảm 100.000đ');
        } else {
            Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        }
    };

    const handlePay = () => {
        clearCart();
        setDiscount(0);
        setVoucherApplied(false);
        navigation.navigate('CheckoutResult');
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <AppText className="text-xl font-bold text-slate-800 ml-2">Thanh toán</AppText>
                <AppText className="text-slate-400 text-sm ml-auto">{cartItems.length} mục</AppText>
            </View>

            {cartItems.length === 0 ? (
                <View className="flex-1 items-center justify-center p-5">
                    <AppText className="text-5xl mb-4">🛒</AppText>
                    <AppText className="text-lg font-bold text-slate-800 mb-2">Không có gì để thanh toán</AppText>
                    <AppText className="text-sm text-slate-500 text-center mb-8">Hãy thêm khóa học vào giỏ hàng trước nhé.</AppText>
                    <Button variant="primary" onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
                        Khám phá khóa học
                    </Button>
                </View>
            ) : (
                <>
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {/* Cart Items */}
                        <View className="p-4">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Khóa học đã chọn
                            </AppText>
                            {cartItems.map((item) => (
                                <View key={item.id} className="flex-row bg-white rounded-2xl p-3 mb-3 border border-slate-100 shadow-sm">
                                    <Image
                                        source={{ uri: item.thumbnail }}
                                        className="w-[72px] h-[72px] rounded-xl bg-slate-200"
                                    />
                                    <View className="flex-1 ml-3 justify-between">
                                        <AppText className="text-[13px] font-bold text-slate-800" numberOfLines={2}>
                                            {item.title}
                                        </AppText>
                                        <View className="flex-row justify-between items-center">
                                            <AppText className="text-sm font-extrabold text-blue-600">{item.price}</AppText>
                                            <TouchableOpacity onPress={() => removeFromCart(item.id)} className="p-1">
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Voucher Section */}
                        <View className="px-4 mb-4">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Mã giảm giá
                            </AppText>
                            <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <View className="flex-row items-center gap-2">
                                    <View className="flex-1 flex-row items-center bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-200">
                                        <Ticket size={18} color="#64748b" />
                                        <TextInput
                                            placeholder="Nhập mã giảm giá..."
                                            placeholderTextColor="#94a3b8"
                                            className="flex-1 ml-2 text-sm text-slate-800"
                                            value={voucherCode}
                                            onChangeText={setVoucherCode}
                                            autoCapitalize="characters"
                                            editable={!voucherApplied}
                                        />
                                    </View>
                                    <Button
                                        variant={voucherApplied ? 'secondary' : 'primary'}
                                        className="px-4 py-2.5 rounded-xl"
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
                                    <AppText className="text-sm text-slate-500">Tạm tính ({cartItems.length} khóa học)</AppText>
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
                        >
                            Thanh toán {formatPrice(total)}
                        </Button>
                    </View>
                </>
            )}
        </View>
    );
};

export default CheckoutScreen;
