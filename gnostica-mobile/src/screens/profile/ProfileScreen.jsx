import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {
    User, CreditCard, Settings, LogOut,
    ChevronRight, Bell, HelpCircle, Shield, Smile, Star, TrendingUp, MessageSquare, Edit3,
    BookOpen, Target, Award, Headset, X, CheckCircle2, Mail, BadgeCheck, RefreshCcw
} from 'lucide-react-native';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import enrollmentService from '../../services/course/enrollmentService';
import api from '../../config/api';

const MENU_GROUPS = [
    {
        title: 'Tài khoản',
        items: [
            { label: 'Thông tin cá nhân', icon: User,       color: '#3B82F6', action: 'showProfileModal' },
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
            { label: 'Yêu cầu hoàn tiền',    icon: RefreshCcw,  color: '#F59E0B', target: 'RefundScreen' },
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

const MenuItem = ({ item, onOpenProfileModal }) => {
    const navigation = useNavigation();
    
    const handlePress = () => {
        if (item.action === 'showProfileModal') {
            onOpenProfileModal();
        } else if (item.target) {
            navigation.navigate(item.target, item.params);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            className="flex-row items-center py-3.5 px-5 border-b border-slate-50"
        >
            <View
                className="w-[38px] h-[38px] rounded-xl items-center justify-center mr-3.5"
                style={{ backgroundColor: item.color }}
            >
                <item.icon size={18} color="#ffffff" strokeWidth={2} />
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
    const [loadingStats, setLoadingStats] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        if (isAuthenticated && isFocused) {
            setLoadingStats(true);
            
            Promise.all([
                enrollmentService.getStats().catch(() => null),
                enrollmentService.getMyCourses().catch(() => null),
                api.get('/certificates/my-certificates').catch(() => null)
            ])
            .then(([statsRes, myCoursesRes, certsRes]) => {
                const statsData = statsRes?.data || statsRes || {};
                const myCoursesList = myCoursesRes?.data || (Array.isArray(myCoursesRes) ? myCoursesRes : []);
                const certsList = certsRes?.data || (Array.isArray(certsRes) ? certsRes : []);

                // Khóa học đã mua/đăng ký
                const totalCourses = statsData.enrolledCourses != null 
                    ? statsData.enrolledCourses 
                    : (statsData.active || 0) + (statsData.completed || 0) || myCoursesList.length;

                // Khóa học hoàn thành
                const completedCourses = statsData.completedCourses != null 
                    ? statsData.completedCourses 
                    : (statsData.completed || 0) || myCoursesList.filter(c => c.completed || c.progressPercent >= 100).length;

                // Số lượng chứng chỉ
                const totalCertificates = certsList.length || statsData.certificates || 0;

                setStats({
                    courses: totalCourses,
                    completed: completedCourses,
                    certificates: totalCertificates
                });
            })
            .finally(() => setLoadingStats(false));
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
                            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Smile size={32} color="#ffffff" />
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
                        <Avatar name={user?.fullName || user?.name || 'Học viên'} size={88} />
                    </View>
                </View>

                {/* Name & Edit */}
                <View className="items-center mt-3">
                    <View className="flex-row items-center">
                        <AppText className="text-[22px] font-extrabold text-slate-800 tracking-tight">
                            {user?.fullName || user?.name || 'Học viên E-Learning'}
                        </AppText>
                        <TouchableOpacity
                            onPress={() => setShowProfileModal(true)}
                            className="ml-2 bg-blue-600 w-7 h-7 rounded-full items-center justify-center"
                        >
                            <Edit3 size={14} color="#ffffff" />
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
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: stat.color, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                                <stat.icon size={20} color="#ffffff" />
                            </View>
                            {loadingStats ? (
                                <ActivityIndicator size="small" color={stat.color} style={{ marginVertical: 4 }} />
                            ) : (
                                <AppText className="text-[20px] font-black text-slate-800">{stat.value}</AppText>
                            )}
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
                        {group.items.map(item => (
                            <MenuItem 
                                key={item.label} 
                                item={item} 
                                onOpenProfileModal={() => setShowProfileModal(true)} 
                            />
                        ))}
                    </View>
                </View>
            ))}

            {/* Logout */}
            <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.75}
                className="mx-5 mt-5 mb-10 py-[15px] rounded-[14px] bg-red-500 flex-row items-center justify-center gap-2.5"
            >
                <LogOut size={18} color="#ffffff" />
                <AppText className="text-[15px] font-bold text-white">Đăng xuất</AppText>
            </TouchableOpacity>

            {/* Thông tin cá nhân Modal */}
            <Modal
                visible={showProfileModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowProfileModal(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                    activeOpacity={1}
                    onPress={() => setShowProfileModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            backgroundColor: '#fff',
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 24,
                            paddingBottom: 36,
                        }}
                    >
                        {/* Drag indicator */}
                        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 20 }} />

                        {/* Title & Close */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} color="#ffffff" />
                                </View>
                                <AppText style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>Thông tin cá nhân</AppText>
                            </View>
                            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={{ padding: 4 }}>
                                <X size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        {/* Avatar & Name Header */}
                        <View style={{ alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 16 }}>
                            <Avatar name={user?.fullName || user?.name || 'Học viên'} size={72} />
                            <AppText style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 12 }}>
                                {user?.fullName || user?.name || 'Học viên E-Learning'}
                            </AppText>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <BadgeCheck size={16} color="#10B981" />
                                <AppText style={{ fontSize: 13, color: '#10B981', fontWeight: '600' }}>Tài khoản đã xác thực</AppText>
                            </View>
                        </View>

                        {/* Detail Fields */}
                        <View style={{ gap: 12 }}>
                            <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <User size={18} color="#64748b" />
                                <View style={{ flex: 1 }}>
                                    <AppText style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', uppercase: true }}>Họ và tên</AppText>
                                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginTop: 2 }}>
                                        {user?.fullName || user?.name || 'Chưa cập nhật'}
                                    </AppText>
                                </View>
                            </View>

                            <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Mail size={18} color="#64748b" />
                                <View style={{ flex: 1 }}>
                                    <AppText style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', uppercase: true }}>Địa chỉ Email</AppText>
                                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#1e293b', marginTop: 2 }}>
                                        {user?.email || 'Chưa cập nhật'}
                                    </AppText>
                                </View>
                            </View>

                            <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <Shield size={18} color="#64748b" />
                                <View style={{ flex: 1 }}>
                                    <AppText style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', uppercase: true }}>Vai trò tài khoản</AppText>
                                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#2563eb', marginTop: 2 }}>
                                        {user?.role === 'ROLE_ADMIN' ? 'Quản trị viên (Admin)' : user?.role === 'ROLE_INSTRUCTOR' ? 'Giảng viên' : 'Học viên (Member)'}
                                    </AppText>
                                </View>
                            </View>

                            <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <CheckCircle2 size={18} color="#64748b" />
                                <View style={{ flex: 1 }}>
                                    <AppText style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', uppercase: true }}>Trạng thái tài khoản</AppText>
                                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#10b981', marginTop: 2 }}>
                                        Hoạt động bình thường
                                    </AppText>
                                </View>
                            </View>
                        </View>

                        {/* Close button */}
                        <TouchableOpacity
                            onPress={() => setShowProfileModal(false)}
                            style={{
                                backgroundColor: '#f1f5f9',
                                paddingVertical: 14,
                                borderRadius: 14,
                                alignItems: 'center',
                                marginTop: 20,
                            }}
                        >
                            <AppText style={{ fontSize: 15, fontWeight: 'bold', color: '#475569' }}>Đóng</AppText>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

export default ProfileScreen;
