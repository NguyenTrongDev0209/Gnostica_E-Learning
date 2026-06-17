import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react-native';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';

const CartScreen = () => {
    const navigation = useNavigation();
    const { cartItems, removeFromCart, clearCart } = useCart();

    const parsePrice = (priceStr) => {
        if (!priceStr || priceStr === 'Miễn phí') return 0;
        return parseInt(priceStr.replace(/\D/g, ''));
    };

    const formatPrice = (priceNum) => {
        if (priceNum === 0) return 'Miễn phí';
        return priceNum.toLocaleString('vi-VN') + 'đ';
    };

    const totalPrice = cartItems.reduce((sum, item) => sum + parsePrice(item.price), 0);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center justify-between pt-[52px] px-5 pb-4 bg-white border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-800">Giỏ hàng</Text>
                <View className="w-8" />
            </View>

            {cartItems.length === 0 ? (
                /* Empty state */
                <View className="flex-1 justify-center items-center p-5">
                    <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-5">
                        <ShoppingBag size={40} color="#2563EB" />
                    </View>
                    <Text className="text-lg font-bold text-slate-800 mb-2">Giỏ hàng trống</Text>
                    <Text className="text-sm text-slate-500 text-center mb-8">
                        Bạn chưa thêm khóa học nào vào giỏ. Hãy quay lại trang chủ để khám phá khóa học!
                    </Text>
                    <Button
                        variant="primary"
                        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                    >
                        Tiếp tục tìm kiếm
                    </Button>
                </View>
            ) : (
                /* Cart Items */
                <>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                        <View className="flex-row justify-between mb-4 items-center">
                            <Text className="text-base font-bold text-slate-800">
                                {cartItems.length} khóa học
                            </Text>
                            <TouchableOpacity onPress={clearCart}>
                                <Text className="text-[13px] text-red-500 font-semibold">Xóa tất cả</Text>
                            </TouchableOpacity>
                        </View>

                        {cartItems.map((item) => (
                            <View key={item.id} className="flex-row bg-white rounded-xl p-3 mb-4 border border-slate-100">
                                <Image
                                    source={{ uri: item.thumbnail }}
                                    className="w-20 h-20 rounded-lg bg-slate-200"
                                />
                                <View className="flex-1 ml-3 justify-between">
                                    <View>
                                        <Text className="text-sm font-bold text-slate-800" numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                        <Text className="text-xs text-slate-500 mt-1">
                                            {item.instructor}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-base font-extrabold text-blue-600">
                                            {item.price}
                                        </Text>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)} className="p-1">
                                            <Trash2 size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Checkout Footer */}
                    <View className="bg-white px-5 py-4 pb-8 border-t border-slate-100">
                        <View className="flex-row justify-between mb-4">
                            <Text className="text-[15px] text-slate-500">Tổng cộng:</Text>
                            <Text className="text-[22px] font-extrabold text-slate-800">
                                {formatPrice(totalPrice)}
                            </Text>
                        </View>
                        <Button
                            variant="primary"
                            className="rounded-xl"
                            textClassName="text-base"
                            onPress={() => navigation.navigate('Checkout')}
                        >
                            Thanh toán ngay
                        </Button>
                    </View>
                </>
            )}
        </View>
    );
};

export default CartScreen;
