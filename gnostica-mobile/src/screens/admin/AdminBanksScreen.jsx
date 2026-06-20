import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Building, Save } from 'lucide-react-native';

export default function AdminBanksScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-[52px] pb-4 px-5 bg-white flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                    <ArrowLeft size={24} color="#334155" />
                </TouchableOpacity>
                <Text className="text-[18px] font-extrabold text-slate-800">Tài khoản ngân hàng</Text>
            </View>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mb-4">
                        <Building size={24} color="#2563EB" />
                    </View>
                    
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-slate-700 mb-2">Tên ngân hàng</Text>
                        <TextInput 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                            value="Vietcombank"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-bold text-slate-700 mb-2">Chủ tài khoản</Text>
                        <TextInput 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                            value="CONG TY TNHH GNOSTICA"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-bold text-slate-700 mb-2">Số tài khoản</Text>
                        <TextInput 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                            value="1903123456789"
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity className="bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center mt-2 shadow-sm shadow-blue-200">
                        <Save size={18} color="#fff" />
                        <Text className="text-white font-extrabold ml-2">Lưu thông tin</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
