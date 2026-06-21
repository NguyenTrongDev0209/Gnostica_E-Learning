import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { ChevronLeft, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = () => {
    const navigation = useNavigation();
    const { login } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-blue-500">
            <View className="flex-1 px-5 pt-8 pb-10 justify-between">
                {/* Header with Back Button */}
                <View className="items-start">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <ChevronLeft color="white" size={32} />
                    </TouchableOpacity>
                </View>

                {/* Logo & Slogan */}
                <View className="items-center justify-center flex-1">
                    <Image
                        source={require('../../assets/images/Gnostica_Mark.webp')}
                        className="w-56 h-24 mb-4"
                        resizeMode="contain"
                        style={{ tintColor: 'white' }}
                    />
                    <AppText className="text-white text-lg text-center px-6 font-medium">
                        Nền tảng e-learning hàng đầu đáp ứng mọi nhu cầu học tập
                    </AppText>
                </View>

                {/* Action Buttons */}
                <View className="w-full">
                    <TouchableOpacity 
                        className="w-full bg-white flex-row items-center justify-center py-4 rounded-lg mb-4" 
                        onPress={() => {
                            // Mock login for now
                            login({ name: 'Google User', email: 'user@gmail.com' });
                            navigation.navigate('Main', { screen: 'Home' });
                        }}
                    >
                        <View className="absolute left-6 w-6 h-6 items-center justify-center">
                            <Image source={{ uri: "https://img.icons8.com/color/48/000000/google-logo.png" }} className="w-6 h-6" />
                        </View>
                        <AppText className="text-slate-800 font-bold text-base">Đăng ký bằng Google</AppText>
                    </TouchableOpacity>

                    <View className="flex-row items-center mb-4">
                        <View className="flex-1 h-[1px] bg-white/40" />
                        <AppText className="text-sm text-white font-medium px-4">hoặc</AppText>
                        <View className="flex-1 h-[1px] bg-white/40" />
                    </View>

                    <TouchableOpacity 
                        className="w-full bg-white flex-row items-center justify-center py-4 rounded-lg" 
                        onPress={() => {
                            navigation.navigate('PhoneLogin');
                        }}
                    >
                        <View className="absolute left-6 w-6 h-6 items-center justify-center">
                            <Phone color="#0f172a" size={24} />
                        </View>
                        <AppText className="text-slate-800 font-bold text-base">Đăng ký bằng số điện thoại</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default RegisterScreen;

