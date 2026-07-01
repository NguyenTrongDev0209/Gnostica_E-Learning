import AppText from '../../components/ui/AppText';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell, BookOpen, CreditCard, Star, Info } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import notificationService from '../../services/notificationService';

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getAll();
            const data = response.data || response.content || response;
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handlePressNotification = async (notification) => {
        if (!notification.isRead && !notification.read) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true, read: true } : n));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const getIconInfo = (type) => {
        switch(type) {
            case 'COURSE_UPDATE': return { icon: BookOpen, color: '#3b82f6' };
            case 'ORDER_STATUS': return { icon: CreditCard, color: '#10b981' };
            case 'REVIEW': return { icon: Star, color: '#f59e0b' };
            default: return { icon: Info, color: '#64748b' };
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader 
                title="Thông báo" 
                rightComponent={
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <AppText className="text-primary font-medium text-sm">Đánh dấu đã đọc</AppText>
                    </TouchableOpacity>
                }
            />

            <ScrollView className="flex-1">
                {loading ? (
                    <View className="py-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : notifications.length === 0 ? (
                    <View className="items-center py-20">
                        <Bell size={48} color="#CBD5E1" strokeWidth={1} />
                        <AppText className="text-slate-500 mt-4">Không có thông báo nào.</AppText>
                    </View>
                ) : (
                    notifications.map(item => {
                        const { icon: IconComp, color } = getIconInfo(item.type);
                        const isRead = item.isRead || item.read;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handlePressNotification(item)}
                                className={`p-4 border-b border-slate-100 flex-row items-start ${isRead ? 'bg-transparent' : 'bg-blue-50/30'}`}
                            >
                                <View
                                    className="w-10 h-10 rounded-full items-center justify-center"
                                    style={{ backgroundColor: color + '15' }}
                                >
                                    <IconComp size={20} color={color} />
                                </View>
                                <View className="flex-1 ml-4">
                                    <View className="flex-row justify-between items-start">
                                        <AppText className={`text-sm flex-1 mr-2 ${isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                                            {item.title}
                                        </AppText>
                                        {!isRead && <View className="w-2 h-2 rounded-full bg-blue-600 mt-1" />}
                                    </View>
                                    <AppText className="text-slate-500 text-xs mt-1 leading-4">{item.message || item.content}</AppText>
                                    <AppText className="text-slate-400 text-[10px] mt-2">{item.createdAt || item.time || 'Vừa xong'}</AppText>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                {!loading && notifications.length > 0 && (
                    <View className="items-center py-8">
                        <AppText className="text-slate-400 text-xs text-center">
                            Bạn đã xem hết tất cả thông báo hiện có.{"\n"}
                            Chúng tôi sẽ gửi thêm khi có tin mới!
                        </AppText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default NotificationsScreen;
