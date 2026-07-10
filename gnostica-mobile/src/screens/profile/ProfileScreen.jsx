import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
    User, CreditCard, Settings, LogOut,
    ChevronRight, Bell, HelpCircle, Shield, Smile, Star, TrendingUp, MessageSquare, Edit3,
    BookOpen, Target, Award, Crown, Headset,
} from 'lucide-react-native';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import enrollmentService from '../../services/course/enrollmentService';

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
            { label: 'Chăm sóc khách hàng',  icon: Headset,     color: '#3B82F6', target: 'Support' },
            { label: 'Về Gnostica',          icon: HelpCircle,  color: '#8B5CF6', target: 'LegalInfo', params: { type: 'about' } },
            { label: 'Chính sách và điều khoản', icon: Shield,  color: '#EC4899', target: 'LegalInfo', params: { type: 'terms' } },
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
    const [stats, setStats] = useState({ courses: 0, completed: 0, certificates: 0 });

    useEffect(() => {
        if (isAuthenticated && isFocused) {
            enrollmentService.getStats()
                .then(res => {
                    const data = res.data || res;
                    setStats({
                        courses: (data.active || 0) + (data.completed || 0),
                        completed: data.completed || 0,
                        certificates: data.certificates || 0
                    });
                })
                .catch(console.error);
        }
    }, [isAuthenticated, isFocused]);

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
                                    onPress={() => navigation.goBack()}
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
            {/* Header with Cover Image */}
            <View style={{ height: 200, width: '100%' }}>
                <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover" 
                />
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />
                
                <View style={{ position: 'absolute', top: Math.max(insets.top, 10) + 12, left: 20 }}>
                    <AppText className="text-[22px] font-extrabold text-white">
                        Cá nhân
                    </AppText>
                </View>
            </View>

            {/* Main Info Card */}
            <View 
                style={{ 
                    marginHorizontal: 20, 
                    marginTop: -60, 
                    backgroundColor: '#fff', 
                    borderRadius: 24, 
                    paddingHorizontal: 20,
                    paddingBottom: 24,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#F1F5F9'
                }}
            >
                {/* Avatar */}
                <View style={{ alignSelf: 'center', marginTop: -44 }}>
                    <View style={{ 
                        borderRadius: 50, padding: 4, backgroundColor: '#fff', 
                        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
                        shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 
                    }}>
                        <Avatar name={user?.name || 'Học viên'} size={88} />
                    </View>
                </View>

                {/* Name & Edit */}
                <View className="items-center mt-3">
                    <View className="flex-row items-center">
                        <AppText className="text-[22px] font-extrabold text-slate-800 tracking-tight">
                            {user?.name || 'Học viên E-Learning'}
                        </AppText>
                        <TouchableOpacity className="ml-2 bg-blue-50 w-7 h-7 rounded-full items-center justify-center">
                            <Edit3 size={14} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    <AppText className="text-[14px] text-slate-500 mt-1 font-medium">
                        {user?.email || 'Chưa cập nhật email'}
                    </AppText>
                </View>

                {/* Stats row with icons */}
                <View className="flex-row mt-6 pt-6 border-t border-slate-100 w-full">
                    {[
                        { label: 'Khóa học',  value: stats.courses, icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF' },
                        { label: 'Hoàn thành', value: stats.completed, icon: Target, color: '#10B981', bg: '#ECFDF5' },
                        { label: 'Chứng chỉ', value: stats.certificates, icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
                    ].map((stat, i) => (
                        <View
                            key={stat.label}
                            className="flex-1 items-center relative"
                        >
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: stat.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <AppText className="text-[20px] font-black text-slate-800">{stat.value}</AppText>
                            <AppText className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-[0.8px] text-center px-1">{stat.label}</AppText>
                            
                            {/* Divider */}
                            {i < 2 && (
                                <View style={{ position: 'absolute', right: 0, top: '10%', bottom: '10%', width: 1, backgroundColor: '#F1F5F9' }} />
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Menu Groups */}
            {MENU_GROUPS.map(group => (
                <View key={group.title} className="mt-4">
                    <AppText className="text-xs font-bold text-slate-400 px-5 mb-2 tracking-[0.8px] uppercase">
                        {group.title}
                    </AppText>
                    <View className="bg-white border-y border-slate-100">
                        {group.items.map(item => <MenuItem key={item.label} item={item} />)}
                    </View>
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
