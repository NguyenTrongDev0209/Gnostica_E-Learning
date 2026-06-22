import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TextInput } from 'react-native';
import { ChevronLeft, Phone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const PhoneLoginScreen = () => {
    const navigation = useNavigation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');

    const handleContinue = () => {
        if (!phoneNumber.trim() || phoneNumber.replace(/[^0-9]/g, '').length < 10) {
            setError('Vui lòng nhập số điện thoại hợp lệ');
            return;
        }
        
        navigation.navigate('PhoneOTP', { phoneNumber });
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
                        <AppText className="text-2xl font-bold text-slate-900 mb-2">Nhập số điện thoại</AppText>
                        <AppText className="text-slate-500 mb-8 text-base">Chúng tôi sẽ gửi mã OTP để xác thực số điện thoại của bạn.</AppText>

                        {/* Input Field */}
                        <View className="relative justify-center mb-2 mt-4">
                            <View className="absolute left-4 z-10">
                                <Phone size={20} color="#64748b" />
                            </View>
                            <TextInput
                                className={`h-14 bg-slate-50 border rounded-lg px-4 pl-14 text-lg text-gray-900 tracking-wide ${error ? 'border-red-500' : 'border-slate-300'}`}
                                placeholderTextColor="#94a3b8"
                                placeholder="09xx xxx xxx"
                                value={phoneNumber}
                                onChangeText={(text) => {
                                    const cleaned = text.replace(/[^0-9]/g, '');
                                    let formatted = '';
                                    for (let i = 0; i < cleaned.length; i++) {
                                        if (i === 4 || i === 7) {
                                            formatted += ' ';
                                        }
                                        formatted += cleaned[i];
                                    }
                                    setPhoneNumber(formatted);
                                    setError('');
                                }}
                                keyboardType="phone-pad"
                                maxLength={12}
                            />
                        </View>
                        {error ? <AppText className="text-red-500 text-sm mb-4">{error}</AppText> : <View className="mb-6" />}

                        {/* Continue Button */}
                        <TouchableOpacity 
                            className="w-full bg-blue-600 flex-row items-center justify-center py-4 rounded-lg mt-auto shadow-sm" 
                            onPress={handleContinue}
                        >
                            <AppText className="text-white font-bold text-base">Tiếp tục</AppText>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PhoneLoginScreen;
