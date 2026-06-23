import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendCode = () => {
        if (validate()) {
            // Mock API call to send reset code
            Alert.alert('Thành công', 'Mã xác thực đã được gửi đến email của bạn.');
            navigation.navigate('ConfirmCode', { email: email });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-slate-50"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                <TouchableOpacity
                    className="mt-12 mb-6 w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-slate-100"
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={20} color="#1e293b" />
                </TouchableOpacity>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <View className="items-center mb-6">
                        <AppText className="text-2xl font-bold text-gray-900 tracking-tight text-center">Quên mật khẩu?</AppText>
                        <AppText className="text-gray-500 mt-2 text-center text-sm">
                            Đừng lo lắng! Nhập địa chỉ email của bạn để chúng tôi gửi mã xác thực khôi phục mật khẩu.
                        </AppText>
                    </View>

                    <Input
                        label="Email"
                        icon={Mail}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: null }); }}
                        containerClassName="mb-1"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {errors.email && <AppText className="text-red-500 text-xs mb-6">{errors.email}</AppText>}
                    {!errors.email && <View className="mb-6" />}

                    <Button variant="primary" className="w-full mb-6" onPress={handleSendCode}>Gửi mã xác thực</Button>

                    <View className="flex-row justify-center">
                        <AppText className="text-sm text-gray-500">Nhớ mật khẩu? </AppText>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <AppText className="text-sm text-primary font-semibold">Đăng nhập ngay</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;
