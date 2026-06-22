import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, Mail, Lock, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';

const EmailRegisterScreen = () => {
    const navigation = useNavigation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

        if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            const response = await authService.register(fullName, email, password);
            setIsLoading(false);
            Alert.alert(
                'Thành công',
                'Đặng ký tài khoản thành công. Vui lòng kiểm tra email để nhận mã xác thực.',
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
                        label="Họ và tên"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChangeText={setFullName}
                        error={errors.fullName}
                        icon={User}
                    />

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

                    <Input
                        label="Xác nhận mật khẩu"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        error={errors.confirmPassword}
                        secureTextEntry
                        icon={Lock}
                    />
                </View>

                <Button
                    variant="primary"
                    className="mt-8 py-4"
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator color="white" /> : 'Đăng ký'}
                </Button>

                <View className="flex-row justify-center mt-6 mb-10">
                    <AppText className="text-slate-500">Đã có tài khoản? </AppText>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <AppText className="text-blue-600 font-bold">Đăng nhập</AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default EmailRegisterScreen;
