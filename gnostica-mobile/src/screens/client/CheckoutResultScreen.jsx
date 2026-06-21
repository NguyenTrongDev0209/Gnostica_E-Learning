import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CircleCheckBig, BookOpen, Home } from 'lucide-react-native';
import Button from '../../components/ui/Button';

const CheckoutResultScreen = () => {
    const navigation = useNavigation();

    return (
        <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        >
            {/* Success Icon */}
            <View className="items-center mb-6">
                <View className="w-24 h-24 rounded-full bg-green-50 items-center justify-center mb-4">
                    <CircleCheckBig size={56} color="#10B981" strokeWidth={1.5} />
                </View>
                <AppText className="text-2xl font-extrabold text-slate-800 mb-2">
                    Thanh toán thành công!
                </AppText>
                <AppText className="text-sm text-slate-500 text-center leading-[22px]">
                    Cảm ơn bạn đã mua khóa học trên Gnostica.{'\n'}
                    Biên lai sẽ được gửi đến email của bạn.
                </AppText>
            </View>

            {/* Order Info Card */}
            <View className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                <View className="flex-row justify-between mb-3">
                    <AppText className="text-xs text-slate-400 font-medium">Mã đơn hàng</AppText>
                    <AppText className="text-xs text-slate-800 font-bold">GN-{Math.floor(Math.random() * 9000 + 1000)}</AppText>
                </View>
                <View className="flex-row justify-between mb-3">
                    <AppText className="text-xs text-slate-400 font-medium">Ngày thanh toán</AppText>
                    <AppText className="text-xs text-slate-800 font-bold">
                        {new Date().toLocaleDateString('vi-VN')}
                    </AppText>
                </View>
                <View className="flex-row justify-between">
                    <AppText className="text-xs text-slate-400 font-medium">Trạng thái</AppText>
                    <View className="bg-green-50 px-2.5 py-1 rounded-lg">
                        <AppText className="text-green-700 text-[10px] font-bold uppercase">Hoàn thành</AppText>
                    </View>
                </View>
            </View>

            {/* Motivational */}
            <View className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-8">
                <AppText className="text-blue-800 font-bold text-sm mb-1">🎯 Bắt đầu học ngay!</AppText>
                <AppText className="text-blue-600 text-xs leading-[18px]">
                    Khóa học đã sẵn sàng trong tab "Khóa học". Hãy bắt đầu hành trình chinh phục kiến thức mới!
                </AppText>
            </View>

            {/* Action Buttons */}
            <Button
                variant="primary"
                className="py-3.5 rounded-xl mb-3"
                textClassName="text-base font-bold"
                icon={BookOpen}
                onPress={() => navigation.navigate('Main', { screen: 'MyCourses' })}
            >
                Xem khóa học của tôi
            </Button>

            <Button
                variant="outline"
                className="py-3.5 rounded-xl"
                textClassName="text-base"
                icon={Home}
                onPress={() => navigation.navigate('Main', { screen: 'Home' })}
            >
                Về trang chủ
            </Button>
        </ScrollView>
    );
};

export default CheckoutResultScreen;
