import React from 'react';
import { View, Text, ScrollView, Button } from 'react-native';

const CheckoutResultScreen = ({ navigation }) => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Thanh toán thành công</Text>
            <Text style={{ marginBottom: 20 }}>Cảm ơn bạn đã mua khóa học. Hệ thống sẽ gửi biên lai tới email.</Text>
            <Button title="Quay về trang chính" onPress={() => navigation.navigate('Home')} />
        </ScrollView>
    );
};

export default CheckoutResultScreen;
