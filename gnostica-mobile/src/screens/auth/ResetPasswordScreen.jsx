import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPasswordScreen = () => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu mới';
        else if (password.length < 6) newErrors.password = 'Mật khẩu phải từ 6 ký tự';

        if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleReset = () => {
        if (validate()) {
            // Mock API reset
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center p-6">
                <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 items-center w-full">
                    <CheckCircle2 size={64} color="#22c55e" className="mb-6" />
                    <Text className="text-2xl font-bold text-gray-900 text-center mb-2">Thành công!</Text>
                    <Text className="text-gray-500 text-center mb-8">
                        Mật khẩu của bạn đã được thay đổi thành công. Giờ đây bạn có thể đăng nhập bằng mật khẩu mới.
                    </Text>
                    <Button variant="primary" className="w-full" onPress={() => navigation.navigate('Login')}>
                        Đăng nhập ngay
                    </Button>
                </View>
            </View>
        );
    }

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
                        <Text className="text-2xl font-bold text-gray-900 tracking-tight text-center">Đặt lại mật khẩu</Text>
                        <Text className="text-gray-500 mt-2 text-center text-sm">
                            Vui lòng tạo một mật khẩu mới an toàn và dễ nhớ nhé.
                        </Text>
                    </View>

                    <View className="mb-4">
                        <Input
                            label="Mật khẩu mới"
                            icon={Lock}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                                    {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                                </TouchableOpacity>
                            }
                        />
                        {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
                    </View>

                    <View className="mb-8">
                        <Input
                            label="Xác nhận mật khẩu"
                            icon={Lock}
                            placeholder="••••••••"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); setErrors({ ...errors, confirmPassword: null }); }}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                                    {showConfirmPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                                </TouchableOpacity>
                            }
                        />
                        {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>}
                    </View>

                    <Button variant="primary" className="w-full" onPress={handleReset}>Cập nhật mật khẩu</Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ResetPasswordScreen;
