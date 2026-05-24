import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { myCourses } from '../../constants/mockData';

const OrdersScreen = ({ navigation }) => {
    // Using myCourses as placeholder for purchased items
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Đơn hàng của tôi</Text>

            {myCourses.map(order => (
                <TouchableOpacity key={order.id} onPress={() => navigation.navigate('CourseDetail', { course: order })} style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800' }}>{order.title}</Text>
                    <Text style={{ color: '#64748B', marginTop: 6 }}>{order.instructor}</Text>
                    <Text style={{ marginTop: 8, color: '#0f766e' }}>{order.progress ? `Tiến độ: ${order.progress}%` : 'Đã mua'}</Text>
                </TouchableOpacity>
            ))}

            {myCourses.length === 0 && (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#64748B' }}>Bạn chưa có đơn hàng nào.</Text>
                </View>
            )}
        </ScrollView>
    );
};

export default OrdersScreen;
