import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ticket, Plus } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


export default function AdminCouponsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Quản lý mã giảm giá" />

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {[1, 2].map((item) => (
                    <View key={item} className="bg-white p-4 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center">
                        <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mr-3">
                            <Ticket size={20} color="#F59E0B" />
                        </View>
                        <View className="flex-1">
                            <AppText className="text-sm font-bold text-slate-800">GNOSTICA2026</AppText>
                            <AppText className="text-xs text-slate-500">Giảm 20% toàn hệ thống</AppText>
                        </View>
                        <View className="items-end">
                            <AppText className="text-xs font-bold text-emerald-500">Còn hiệu lực</AppText>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
