import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building, Save } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


export default function AdminBanksScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Tài khoản ngân hàng" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mb-4">
                        <Building size={24} color="#2563EB" />
                    </View>
                    
                    <View className="mb-4">
                        <AppText className="text-sm font-bold text-slate-700 mb-2">Tên ngân hàng</AppText>
                        <TextInput 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                            value="Vietcombank"
                        />
                    </View>

                    <View className="mb-4">
                        <AppText className="text-sm font-bold text-slate-700 mb-2">Chủ tài khoản</AppText>
                        <TextInput 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                            value="CONG TY TNHH GNOSTICA"
                        />
                    </View>

                    <View className="mb-4">
                        <AppText className="text-sm font-bold text-slate-700 mb-2">Số tài khoản</AppText>
                        <TextInput 
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800"
                            value="1903123456789"
                            keyboardType="numeric"
                        />
                    </View>

                    <TouchableOpacity className="bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center mt-2 shadow-sm shadow-blue-200">
                        <Save size={18} color="#fff" />
                        <AppText className="text-white font-extrabold ml-2">Lưu thông tin</AppText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
