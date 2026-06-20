import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';

const PhoneOTPScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { login } = useAuth();
    const { showLoading, hideLoading } = useLoading();
    const { phoneNumber = '' } = route.params || {};

    const [otp, setOtp] = useState('');
    const inputRef = useRef(null);

    const handleVerify = () => {
        if (otp.length === 6) {
            showLoading('Đang xác thực...');
            // Mock API delay
            setTimeout(() => {
                hideLoading();
                login({ name: 'Phone User', email: phoneNumber });
                navigation.navigate('Main', { screen: 'Home' });
            }, 1500);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 px-5 pt-8 pb-10">
                        {/* Header with Back Button */}
                        <View className="items-start mb-6">
                            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                                <ChevronLeft color="#0f172a" size={32} />
                            </TouchableOpacity>
                        </View>

                        {/* Title */}
                        <Text className="text-2xl font-bold text-slate-900 mb-2">Nhập mã xác thực</Text>
                        <Text className="text-slate-500 mb-8 text-base leading-6">
                            Mã xác thực gồm 6 chữ số đã được gửi tới số điện thoại <Text className="font-semibold text-slate-800">{phoneNumber}</Text>
                        </Text>

                        {/* OTP Input UI */}
                        <View className="flex-row justify-between mb-8 relative" onTouchEnd={() => inputRef.current?.focus()}>
                            {[0, 1, 2, 3, 4, 5].map((index) => {
                                const isFocused = otp.length === index;
                                const isFilled = otp.length > index;
                                return (
                                    <View 
                                        key={index}
                                        className={`w-12 h-14 border-2 rounded-lg items-center justify-center 
                                            ${isFocused ? 'border-blue-600 bg-blue-50' : isFilled ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-50'}`}
                                    >
                                        <Text className="text-2xl font-bold text-slate-900">
                                            {otp[index] || ''}
                                        </Text>
                                    </View>
                                );
                            })}
                            
                            {/* Hidden TextInput */}
                            <TextInput
                                ref={inputRef}
                                value={otp}
                                onChangeText={(text) => {
                                    setOtp(text.replace(/[^0-9]/g, '').slice(0, 6));
                                }}
                                keyboardType="number-pad"
                                maxLength={6}
                                className="absolute w-full h-full opacity-0"
                                autoFocus
                            />
                        </View>

                        {/* Resend */}
                        <View className="flex-row justify-center mb-8">
                            <Text className="text-slate-500 text-base">Chưa nhận được mã? </Text>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-semibold text-base">Gửi lại</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Continue Button */}
                        <TouchableOpacity 
                            className={`w-full flex-row items-center justify-center py-4 rounded-lg mt-auto shadow-sm ${otp.length === 6 ? 'bg-blue-600' : 'bg-slate-300'}`} 
                            onPress={handleVerify}
                            disabled={otp.length !== 6}
                        >
                            <Text className="text-white font-bold text-base">Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PhoneOTPScreen;
