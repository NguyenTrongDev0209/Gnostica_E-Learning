import React from 'react';
import { View, Text, ScrollView, Button } from 'react-native';

const ChangePasswordScreen = ({ navigation }) => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Thay đổi mật khẩu</Text>
            <Text style={{ marginBottom: 12 }}>Form thay đổi mật khẩu sẽ được thêm ở đây.</Text>
            <Button title="Lưu" onPress={() => navigation.goBack()} />
        </ScrollView>
    );
};

export default ChangePasswordScreen;
