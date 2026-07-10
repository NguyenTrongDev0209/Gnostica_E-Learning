import React from 'react';
import { View } from 'react-native';
import AppHeader from '../../components/ui/AppHeader';
import AppText from '../../components/ui/AppText';
import { Headset } from 'lucide-react-native';

const SupportScreen = () => {
    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader title="Chăm sóc khách hàng" />
            <View className="flex-1 items-center justify-center p-5">
                <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
                    <Headset size={48} color="#2563EB" />
                </View>
                <AppText className="text-[22px] font-extrabold text-slate-800 text-center mb-3">
                    Trung tâm hỗ trợ
                </AppText>
                <AppText className="text-[15px] text-slate-500 text-center leading-6 px-4">
                    Tính năng đang được phát triển. Bạn sẽ sớm có thể trò chuyện trực tiếp với nhân viên hỗ trợ của Gnostica tại đây.
                </AppText>
            </View>
        </View>
    );
};

export default SupportScreen;
