import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
    User, CreditCard, Settings, LogOut,
    ChevronRight, Bell, HelpCircle, Shield, Smile, Star, TrendingUp,
} from 'lucide-react-native';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const MENU_GROUPS = [
    {
        title: 'Tài khoản',
        items: [
            { label: 'Thông tin cá nhân', icon: User,       color: '#3B82F6', target: 'Profile' },
            { label: 'Khóa học đã lưu',  icon: Star,       color: '#EC4899', target: 'Wishlist' },
            { label: 'Chứng chỉ của tôi', icon: CreditCard, color: '#10B981', target: 'Certificates' },
            { label: 'Mã giảm giá',      icon: Bell,       color: '#F59E0B', target: 'Vouchers' },
            { label: 'Thông báo',        icon: Bell,       color: '#3B82F6', target: 'Notifications' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { label: 'Cài đặt',              icon: Settings,    color: '#64748B', target: 'Settings' },
            { label: 'Về Gnostica',          icon: HelpCircle,  color: '#8B5CF6', target: 'LegalInfo', params: { type: 'about' } },
            { label: 'Chính sách bảo mật',   icon: Shield,      color: '#EC4899', target: 'LegalInfo', params: { type: 'privacy' } },
            { label: 'Điều khoản sử dụng',   icon: Shield,      color: '#64748B', target: 'LegalInfo', params: { type: 'terms' } },
        ],
    },
    {
        title: 'Dành cho giảng viên',
        items: [
            { label: 'Bảng điều khiển giảng viên', icon: TrendingUp, color: '#2563EB', target: 'InstructorDashboard' },
        ],
    },
    {
        title: 'Dành cho quản trị viên',
        items: [
            { label: 'Bảng điều khiển admin', icon: Shield, color: '#DC2626', target: 'AdminDashboard' },
        ],
    },
];

const MenuItem = ({ item }) => {
    const navigation = useNavigation();
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => item.target && navigation.navigate(item.target, item.params)}
            className="flex-row items-center py-3.5 px-5 border-b border-slate-50"
        >
            <View
                className="w-[38px] h-[38px] rounded-xl items-center justify-center mr-3.5"
                style={{ backgroundColor: item.color + '18' }}
            >
                <item.icon size={18} color={item.color} strokeWidth={2} />
            </View>
            <Text className="flex-1 text-[15px] text-slate-800 font-medium">{item.label}</Text>
            <ChevronRight size={16} color="#CBD5E1" />
        </TouchableOpacity>
    );
};

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated, user, logout } = useAuth();

    // Unauthenticated state
    if (!isAuthenticated) {
        return (
            <View className="flex-1 bg-slate-50 justify-center items-center p-5">
                <View className="mb-4">
                    <Smile size={64} color="#2563EB" />
                </View>
                <Text className="text-[22px] font-extrabold text-slate-800 mb-2 text-center">
                    Chào bạn mới
                </Text>
                <Text className="text-sm text-slate-500 text-center mb-8 leading-[22px]">
                    Đăng nhập để xem thông tin cá nhân, cập nhật cài đặt và theo dõi chứng chỉ của bạn.
                </Text>
                <Button
                    variant="primary"
                    className="w-full max-w-[300px] py-3.5"
                    onPress={() => navigation.navigate('Login')}
                >
                    Đăng nhập hoặc Đăng ký
                </Button>
            </View>
        );
    }

    const handleLogout = () => {
        logout();
        navigation.navigate('Main', { screen: 'Home' });
    };

    return (
        <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="bg-white pt-[52px] px-5 pb-7 items-center border-b border-slate-100">
                <Text className="text-[22px] font-extrabold text-slate-800 self-start mb-5">
                    Cá nhân
                </Text>
                <Avatar name={user?.name || 'Học viên'} size={80} />
                <Text className="text-[20px] font-extrabold text-slate-800 mt-3.5">
                    {user?.name || 'Học viên E-Learning'}
                </Text>
                <Text className="text-sm text-slate-500 mt-1">
                    {user?.email || 'Chưa cập nhật email'}
                </Text>

                {/* Stats row */}
                <View className="flex-row mt-5 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    {[
                        { label: 'Khóa học',  value: '3' },
                        { label: 'Hoàn thành', value: '1' },
                        { label: 'Chứng chỉ', value: '1' },
                    ].map((stat, i) => (
                        <View
                            key={stat.label}
                            className="flex-1 items-center py-3.5"
                            style={{ borderRightWidth: i < 2 ? 1 : 0, borderRightColor: '#E2E8F0' }}
                        >
                            <Text className="text-[20px] font-extrabold text-blue-600">{stat.value}</Text>
                            <Text className="text-[11px] text-slate-500 mt-0.5 font-medium">{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Menu Groups */}
            {MENU_GROUPS.map(group => (
                <View key={group.title} className="mt-4 bg-white">
                    <Text className="text-xs font-bold text-slate-400 px-5 pt-3.5 pb-1.5 tracking-[0.8px] uppercase">
                        {group.title}
                    </Text>
                    {group.items.map(item => <MenuItem key={item.label} item={item} />)}
                </View>
            ))}

            {/* Logout */}
            <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.75}
                className="mx-5 mt-5 mb-10 py-[15px] rounded-[14px] bg-red-50 border border-red-200 flex-row items-center justify-center gap-2.5"
            >
                <LogOut size={18} color="#EF4444" />
                <Text className="text-[15px] font-bold text-red-500">Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ProfileScreen;
