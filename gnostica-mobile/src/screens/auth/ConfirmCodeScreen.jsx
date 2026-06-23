import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';

const ConfirmCodeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { email, mode } = route.params || { email: 'your email', mode: 'verify' };

    const [code, setCode] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!code.trim()) newErrors.code = 'Vui lòng nhập mã xác thực';
        else if (code.length < 6) newErrors.code = 'Mã xác thực phải có tối thiểu 6 ký tự';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleVerify = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            await authService.verifyOTP(email, code);
            setIsLoading(false);
            Alert.alert(
                'Thành công',
                'Xác thực tài khoản thành công! Bây giờ bạn có thể đăng nhập.',
                [{ text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Lỗi', error.message || 'Xác thực không thành công. Vui lòng thử lại.');
        }
    };

    const handleResendOTP = async () => {
        try {
            await authService.resendOTP(email);
            Alert.alert('Thông báo', 'Mã xác thực mới đã được gửi lại.');
        } catch (error) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã.');
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
                        <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                            <ShieldCheck size={32} color="#2563eb" />
                        </View>
                        <AppText className="text-2xl font-bold text-gray-900 tracking-tight text-center">Xác thực OTP</AppText>
                        <AppText className="text-gray-500 mt-2 text-center text-sm">
                            Vui lòng nhập mã xác thực đã được gửi tới {"\n"}
                            <AppText className="font-semibold text-slate-900">{email}</AppText>
                        </AppText>
                    </View>

                    <Input
                        label="Mã xác thực"
                        placeholder="123456"
                        value={code}
                        onChangeText={(text) => { setCode(text); setErrors({ ...errors, code: null }); }}
                        containerClassName="mb-1"
                        keyboardType="number-pad"
                        textAlign="center"
                        style={{ fontSize: 24, letterSpacing: 8, fontWeight: 'bold' }}
                    />
                    {errors.code && <AppText className="text-red-500 text-xs mb-6 text-center">{errors.code}</AppText>}
                    {!errors.code && <View className="mb-6" />}

                    <Button
                        variant="primary"
                        className="w-full mb-6 py-4"
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : 'Xác nhận'}
                    </Button>

                    <View className="items-center">
                        <AppText className="text-sm text-gray-500 mb-2">Chưa nhận được mã?</AppText>
                        <TouchableOpacity onPress={handleResendOTP}>
                            <AppText className="text-sm text-primary font-semibold">Gửi lại mã</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ConfirmCodeScreen;
