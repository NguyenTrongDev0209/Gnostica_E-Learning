import React from 'react';
import { View, Text, ScrollView, Button, TouchableOpacity } from 'react-native';
import { useCart } from '../../context/CartContext';
import CourseCard from '../../components/home/CourseCard';

const CheckoutScreen = ({ navigation }) => {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const handlePay = () => {
        // In a real app, call payment API here
        clearCart();
        navigation.navigate('CheckoutResult');
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Thanh toán</Text>

            {cartItems.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#64748B' }}>Giỏ hàng trống</Text>
                </View>
            ) : (
                <View>
                    {cartItems.map(item => (
                        <View key={item.id} style={{ marginBottom: 12 }}>
                            <CourseCard course={item} />
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ padding: 8 }}>
                                    <Text style={{ color: '#EF4444', fontWeight: '700' }}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View style={{ marginTop: 12 }}>
                        <Button title={`Thanh toán (${cartItems.length} mục)`} onPress={handlePay} />
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

export default CheckoutScreen;
