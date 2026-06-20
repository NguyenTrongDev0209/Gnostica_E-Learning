import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
    const navigation = useNavigation();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
        else if (password.length < 6) newErrors.password = 'Mật khẩu phải từ 6 ký tự';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = () => {
        if (validate()) {
            // Mock API Call
            login({ name: 'Học viên Demo', email: email });
            navigation.navigate('Main', { screen: 'Home' });
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-slate-50"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40 }}>
                <View className="items-center mb-8">
                    <Image
                        source={require('../../assets/images/Gnostica_Mark.webp')}
                        className="w-56 h-24"
                        resizeMode="contain"
                    />
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-bold text-gray-900 tracking-tight">Chào mừng trở lại!</Text>
                        <Text className="text-gray-500 mt-2 text-center text-sm">Đăng nhập để tiếp tục hành trình học tập của bạn.</Text>
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
                    {errors.email && <Text className="text-red-500 text-xs mb-3">{errors.email}</Text>}
                    {!errors.email && <View className="mb-4" />}

                    <View className="mb-1">
                        <View className="flex-row justify-between mb-1.5 items-center">
                            <Text className="text-sm font-medium text-slate-700">Mật khẩu</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text className="text-xs text-primary font-medium">Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </View>
                        <Input
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
                    </View>
                    {errors.password && <Text className="text-red-500 text-xs mb-3">{errors.password}</Text>}
                    {!errors.password && <View className="mb-6" />}

                    <Button variant="primary" className="w-full mb-6" onPress={handleLogin}>Đăng nhập</Button>

                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-[1px] bg-slate-200" />
                        <Text className="text-xs text-slate-500 font-medium px-3">Hoặc đăng nhập với</Text>
                        <View className="flex-1 h-[1px] bg-slate-200" />
                    </View>

                    <Button variant="outline" className="w-full" textClassName="text-slate-700 font-semibold" icon={() => (
                        <Image source={{ uri: "https://img.icons8.com/color/48/000000/google-logo.png" }} className="w-5 h-5 mr-3" />
                    )} onPress={() => Alert.alert('Tính năng đang phát triển')}>
                        Tiếp tục với Google
                    </Button>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-sm text-gray-500">Chưa có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text className="text-sm text-primary font-semibold">Đăng ký miễn phí</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="mt-8 items-center" onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
                        <Text className="text-sm text-gray-400 font-medium">Trở lại trang chủ</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
