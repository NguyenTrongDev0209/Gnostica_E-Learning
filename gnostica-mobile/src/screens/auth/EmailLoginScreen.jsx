import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/auth/authService';
import { useAuth } from '../../context/AuthContext';

const EmailLoginScreen = () => {
    const navigation = useNavigation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await authService.login(email, password);
            await login(response); // Cập nhật state trong AuthContext
            setIsLoading(false);
            navigation.navigate('Main', { screen: 'Home' });
        } catch (error) {
            setIsLoading(false);
            const rawMsg = error?.message || error?.data?.message || '';
            let friendlyMessage = rawMsg;
            if (rawMsg.toLowerCase().includes('bad credentials')) {
                friendlyMessage = 'Email hoặc mật khẩu không chính xác. Nếu bạn mới đăng ký, vui lòng xác thực mã OTP trước.';
            } else if (!friendlyMessage) {
                friendlyMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
            }
            Alert.alert('Đăng nhập thất bại', friendlyMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-12">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 mb-6"
                >
                    <ChevronLeft color="#1e293b" size={24} />
                </TouchableOpacity>

                <View className="mb-8">
                    <AppText className="text-3xl font-bold text-slate-900 mb-2">Chào mừng trở lại</AppText>
                    <AppText className="text-slate-500">Đăng nhập để tiếp tục hành trình học tập của bạn</AppText>
                </View>

                <View className="space-y-4">
                    <Input
                        label="Email (Gmail)"
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={Mail}
                    />

                    <Input
                        label="Mật khẩu"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        error={errors.password}
                        secureTextEntry
                        icon={Lock}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        className="items-end mt-2"
                    >
                        <AppText className="text-blue-600 font-semibold text-sm">Quên mật khẩu?</AppText>
                    </TouchableOpacity>
                </View>

                <Button
                    variant="primary"
                    className="mt-8 py-4"
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="white" /> : 'Đăng nhập'}
                </Button>

                <View className="flex-row justify-center mt-6 mb-10">
                    <AppText className="text-slate-500">Chưa có tài khoản? </AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <AppText className="text-blue-600 font-bold">Đăng ký ngay</AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EmailLoginScreen;
