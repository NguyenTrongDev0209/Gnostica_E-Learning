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
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16,
                backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>Giỏ hàng</Text>
                <View style={{ width: 32 }} />
            </View>

            {cartItems.length === 0 ? (
                /* Empty state */
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{
                        width: 80, height: 80, borderRadius: 40,
                        backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 20
                    }}>
                        <ShoppingBag size={40} color="#2563EB" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>
                        Giỏ hàng trống
                    </Text>
                    <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32 }}>
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>
                                {cartItems.length} khóa học
                            </Text>
                            <TouchableOpacity onPress={clearCart}>
                                <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '600' }}>Xóa tất cả</Text>
                            </TouchableOpacity>
                        </View>

                        {cartItems.map((item) => (
                            <View key={item.id} style={{
                                flexDirection: 'row', backgroundColor: '#ffffff',
                                borderRadius: 12, padding: 12, marginBottom: 16,
                                borderWidth: 1, borderColor: '#F1F5F9',
                            }}>
                                <Image
                                    source={{ uri: item.thumbnail }}
                                    style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#E2E8F0' }}
                                />
                                <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }} numberOfLines={2}>
                                            {item.title}
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                                            {item.instructor}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#2563EB' }}>
                                            {item.price}
                                        </Text>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ padding: 4 }}>
                                            <Trash2 size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Checkout Footer */}
                    <View style={{
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32,
                        borderTopWidth: 1, borderTopColor: '#F1F5F9',
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ fontSize: 15, color: '#64748B' }}>Tổng cộng:</Text>
                            <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B' }}>
                                {formatPrice(totalPrice)}
                            </Text>
                        </View>
                        <Button
                            variant="primary"
                            style={{ borderRadius: 12 }}
                            textStyle={{ fontSize: 16 }}
                            onPress={() => {
                                // Mock payment success
                                alert('Thanh toán thành công! Khóa học đã được thêm vào của bạn.');
                                clearCart();
                                navigation.navigate('Main', { screen: 'MyCourses' });
                            }}
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
