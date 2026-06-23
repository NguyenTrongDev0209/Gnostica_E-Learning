import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, BookOpen, CreditCard, Star } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';

const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        title: 'Khóa học mới ra mắt!',
        message: 'Khóa học "Next.js 14 Masterclass" vừa được cập nhật nội dung mới. Xem ngay!',
        time: '2 giờ trước',
        icon: BookOpen,
        color: '#3b82f6',
        read: false
    },
    {
        id: '2',
        title: 'Thanh toán thành công',
        message: 'Đơn hàng #GN-8892 của bạn đã được xác nhận. Chúc bạn học tốt!',
        time: '1 ngày trước',
        icon: CreditCard,
        color: '#10b981',
        read: true
    },
    {
        id: '3',
        title: 'Đánh giá khóa học',
        message: 'Bạn thấy khóa học "UI Design" thế nào? Hãy dành chút thời gian đánh giá nhé.',
        time: '3 ngày trước',
        icon: Star,
        color: '#f59e0b',
        read: true
    }
];

const NotificationsScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader 
                title="Thông báo" 
                rightComponent={
                    <TouchableOpacity>
                        <AppText className="text-primary font-medium text-sm">Đánh dấu đã đọc</AppText>
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1">
                {MOCK_NOTIFICATIONS.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        className={`p-4 border-b border-slate-100 flex-row items-start ${item.read ? 'bg-transparent' : 'bg-blue-50/30'}`}
                    >
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: item.color + '15' }}
                        >
                            <item.icon size={20} color={item.color} />
                        </View>
                        <View className="flex-1 ml-4">
                            <View className="flex-row justify-between items-start">
                                <AppText className={`text-sm ${item.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                                    {item.title}
                                </AppText>
                                {!item.read && <View className="w-2 h-2 rounded-full bg-blue-600 mt-1" />}
                            </View>
                            <AppText className="text-slate-500 text-xs mt-1 leading-4">{item.message}</AppText>
                            <AppText className="text-slate-400 text-[10px] mt-2">{item.time}</AppText>
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="items-center py-8">
                    <AppText className="text-slate-400 text-xs text-center">
                        Bạn đã xem hết tất cả thông báo hiện có.{"\n"}
                        Chúng tôi sẽ gửi thêm khi có tin mới!
                    </AppText>
                </View>
            </ScrollView>
        </View>
    );
};

export default NotificationsScreen;
