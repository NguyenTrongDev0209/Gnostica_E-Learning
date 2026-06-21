import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
    User, CreditCard, Settings, LogOut,
    ChevronRight, Bell, HelpCircle, Shield, Smile, Star, TrendingUp, MessageSquare,
} from 'lucide-react-native';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MENU_GROUPS = [
    {
        title: 'Tài khoản',
        items: [
            { label: 'Thông tin cá nhân', icon: User,       color: '#3B82F6', target: 'Profile' },
            { label: 'Tiến độ học tập',  icon: TrendingUp, color: '#10B981', target: 'LearningProgress' },
            { label: 'Khóa học đã lưu',  icon: Star,       color: '#EC4899', target: 'Wishlist' },
            { label: 'Giảng viên yêu thích', icon: Star, color: '#F59E0B', target: 'FavoriteInstructors' },
            { label: 'Bài viết của tôi', icon: MessageSquare, color: '#8B5CF6', target: 'MyForumPosts' },
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
            { label: 'Đăng ký giảng viên', icon: TrendingUp, color: '#10B981', target: 'ApplyInstructor' },
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
            <AppText className="flex-1 text-[15px] text-slate-800 font-medium">{item.label}</AppText>
            <ChevronRight size={16} color="#CBD5E1" />
        </TouchableOpacity>
    );
};

const ProfileScreen = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { isAuthenticated, user, logout } = useAuth();
    const insets = useSafeAreaInsets();

    // Unauthenticated state
    if (!isAuthenticated) {
        return (
            <View className="flex-1 bg-slate-50">
                <Modal
                    visible={isFocused}
                    transparent={true}
                    animationType="fade"
                    statusBarTranslucent
                >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                        <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
                            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Smile size={32} color="#2563EB" />
                            </View>
                            <AppText style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1e293b', marginBottom: 8, textAlign: 'center' }}>
                                Yêu cầu đăng nhập
                            </AppText>
                            <AppText style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24, lineHeight: 22, fontFamily: 'Inter_400Regular' }}>
                                Vui lòng đăng nhập để xem thông tin cá nhân, lưu khóa học yêu thích và theo dõi tiến độ học tập.
                            </AppText>
                            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                                <Button
                                    variant="outline"
                                    className="flex-1 py-3.5 rounded-xl border-slate-200"
                                    textClassName="text-slate-600 font-semibold"
                                    onPress={() => navigation.navigate('Home')}
                                >
                                    Từ chối
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 py-3.5 rounded-xl"
                                    textClassName="font-semibold"
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    Đăng nhập
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    const handleLogout = () => {
        logout();
        navigation.navigate('Main', { screen: 'Home' });
    };

    return (
        <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
            {/* Header */}
            <View className="bg-white px-5 pb-7 items-center border-b border-slate-100" style={{ paddingTop: Math.max(insets.top, 20) + 12 }}>
                <AppText className="text-[22px] font-extrabold text-slate-800 self-start mb-5">
                    Cá nhân
                </AppText>
                <Avatar name={user?.name || 'Học viên'} size={80} />
                <AppText className="text-[20px] font-extrabold text-slate-800 mt-3.5">
                    {user?.name || 'Học viên E-Learning'}
                </AppText>
                <AppText className="text-sm text-slate-500 mt-1">
                    {user?.email || 'Chưa cập nhật email'}
                </AppText>

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
                            <AppText className="text-[20px] font-extrabold text-blue-600">{stat.value}</AppText>
                            <AppText className="text-[11px] text-slate-500 mt-0.5 font-medium">{stat.label}</AppText>
                        </View>
                    ))}
                </View>
            </View>

            {/* Menu Groups */}
            {MENU_GROUPS.map(group => (
                <View key={group.title} className="mt-4 bg-white">
                    <AppText className="text-xs font-bold text-slate-400 px-5 pt-3.5 pb-1.5 tracking-[0.8px] uppercase">
                        {group.title}
                    </AppText>
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
                <AppText className="text-[15px] font-bold text-red-500">Đăng xuất</AppText>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ProfileScreen;
