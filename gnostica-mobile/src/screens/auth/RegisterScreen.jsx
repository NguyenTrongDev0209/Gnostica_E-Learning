import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 bg-slate-50"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
                <View className="items-center mb-8">
                    <Image
                        source={require('../../assets/images/Gnostica_Mark.webp')}
                        className="w-24 h-24"
                        resizeMode="contain"
                    />
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-bold text-gray-900 tracking-tight">Tạo tài khoản</Text>
                        <Text className="text-gray-500 mt-2 text-center text-sm">Bắt đầu hành trình học tập cùng Gnostica ngay hôm nay.</Text>
                    </View>

                    <Input
                        label="Họ và tên"
                        icon={UserIcon}
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChangeText={setFullName}
                        containerClassName="mb-4"
                        autoCapitalize="words"
                    />

                    <Input
                        label="Email hoặc Số điện thoại"
                        icon={Mail}
                        placeholder="you@example.com"
                        value={email}
                        onChangeText={setEmail}
                        containerClassName="mb-4"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View className="mb-6">
                        <View className="flex-row justify-between mb-1.5 items-center">
                            <Text className="text-sm font-medium text-slate-700">Mật khẩu</Text>
                        </View>
                        <Input
                            icon={Lock}
                            placeholder="••••••••"
                            secureTextEntry={!!(!showPassword)}
                            value={password}
                            onChangeText={setPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                                    {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                                </TouchableOpacity>
                            }
                        />
                    </View>

                    <Button variant="primary" className="w-full mb-6">Đăng ký tài khoản</Button>

                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-[1px] bg-slate-200" />
                        <Text className="text-xs text-slate-500 font-medium px-3">Hoặc đăng ký qua</Text>
                        <View className="flex-1 h-[1px] bg-slate-200" />
                    </View>

                    <Button variant="outline" className="w-full" textClassName="text-slate-700 font-semibold" icon={() => (
                        <Image source={{ uri: "https://img.icons8.com/color/48/000000/google-logo.png" }} className="w-5 h-5 mr-3" />
                    )}>
                        Tiếp tục với Google
                    </Button>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-sm text-gray-500">Đã có tài khoản? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text className="text-sm text-primary font-semibold">Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="mt-8 items-center" onPress={() => navigation.navigate('Home')}>
                        <Text className="text-sm text-gray-400 font-medium">Trở lại trang chủ</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default RegisterScreen;
