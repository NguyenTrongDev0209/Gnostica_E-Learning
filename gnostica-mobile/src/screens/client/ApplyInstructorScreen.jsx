import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Upload, CheckCircle2 } from 'lucide-react-native';

export default function ApplyInstructorScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Đăng ký giảng viên</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
                    <Text className="text-blue-800 font-bold mb-2">Trở thành đối tác của Gnostica!</Text>
                    <Text className="text-blue-600 text-xs leading-5">Hãy chia sẻ kiến thức của bạn với hàng ngàn học viên và kiếm thêm thu nhập một cách thụ động.</Text>
                </View>

                <View className="mb-5">
                    <Text className="text-sm font-bold text-slate-700 mb-2">Họ và tên</Text>
                    <TextInput 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800"
                        placeholder="Nhập họ và tên thật"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-sm font-bold text-slate-700 mb-2">Số điện thoại</Text>
                    <TextInput 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800"
                        placeholder="Nhập số điện thoại liên hệ"
                        keyboardType="phone-pad"
                    />
                </View>

                <View className="mb-5">
                    <Text className="text-sm font-bold text-slate-700 mb-2">Giới thiệu bản thân (Kinh nghiệm)</Text>
                    <TextInput 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-800"
                        placeholder="Mô tả về chuyên môn và kinh nghiệm giảng dạy của bạn..."
                        multiline
                        numberOfLines={4}
                        style={{ textAlignVertical: 'top', height: 100 }}
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-700 mb-2">Hồ sơ năng lực (Tùy chọn)</Text>
                    <TouchableOpacity className="border-2 border-dashed border-slate-200 bg-white rounded-xl p-5 items-center justify-center">
                        <Upload size={24} color="#94A3B8" className="mb-2" />
                        <Text className="text-sm text-slate-500 font-medium">Tải lên CV / Portfolio</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="bg-blue-600 rounded-xl py-4 items-center justify-center mb-10 shadow-sm shadow-blue-200">
                    <Text className="text-white font-extrabold text-base">Gửi yêu cầu đăng ký</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
