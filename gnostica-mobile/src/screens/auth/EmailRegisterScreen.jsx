import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/auth/authService';

const EmailRegisterScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 8) newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        // Backend bắt buộc fullName (@NotBlank) — lấy mặc định từ phần đầu email
        const fullName = email.trim().split('@')[0] || 'Học viên Gnostica';

        setIsLoading(true);
        try {
            await authService.register(fullName, email, password);
            setIsLoading(false);
            Alert.alert(
                'Thành công',
                'Đăng ký tài khoản thành công. Vui lòng kiểm tra email để nhận mã xác thực.',
                [{ text: 'OK', onPress: () => navigation.navigate('ConfirmCode', { email }) }]
            );
        } catch (error) {
            setIsLoading(false);
            Alert.alert('Lỗi', error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
                    <AppText className="text-3xl font-bold text-slate-900 mb-2">Tạo tài khoản</AppText>
                    <AppText className="text-slate-500">Bắt đầu hành trình học tập của bạn ngay hôm nay</AppText>
                </View>

                <View className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={Mail}
                        className="h-14"
                    />

                    <Input
                        label="Mật khẩu"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        error={errors.password}
                        secureTextEntry
                        icon={Lock}
                        containerClassName="mt-3"
                        className="h-14"
                    />
                </View>

                <Button
                    variant="primary"
                    className="mt-8 h-14"
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="white" /> : 'Đăng ký'}
                </Button>

                <View className="mt-2 mb-10">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('EmailLogin')}
                        className="items-center justify-center py-2"
                    >
                        <AppText className="text-blue-600 font-semibold text-sm">Đã có tài khoản</AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EmailRegisterScreen;
