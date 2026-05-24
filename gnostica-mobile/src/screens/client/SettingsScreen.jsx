import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const SettingsScreen = ({ navigation }) => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Cài đặt tài khoản</Text>

            <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')} style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Thay đổi mật khẩu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Đơn hàng của tôi</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CourseCatalog')} style={{ backgroundColor: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Khám phá khóa học</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

export default SettingsScreen;
