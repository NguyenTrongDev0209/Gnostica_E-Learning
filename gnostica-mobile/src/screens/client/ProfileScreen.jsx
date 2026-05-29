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
            { label: 'Thông tin cá nhân', icon: User, color: '#3B82F6', target: 'Profile' },
            { label: 'Khóa học đã lưu', icon: Star, color: '#EC4899', target: 'Wishlist' },
            { label: 'Chứng chỉ của tôi', icon: CreditCard, color: '#10B981', target: 'Certificates' },
            { label: 'Mã giảm giá', icon: Bell, color: '#F59E0B', target: 'Vouchers' },
            { label: 'Thông báo', icon: Bell, color: '#3B82F6', target: 'Notifications' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { label: 'Cài đặt', icon: Settings, color: '#64748B', target: 'Settings' },
            { label: 'Về Gnostica', icon: HelpCircle, color: '#8B5CF6', target: 'LegalInfo', params: { type: 'about' } },
            { label: 'Chính sách bảo mật', icon: Shield, color: '#EC4899', target: 'LegalInfo', params: { type: 'privacy' } },
            { label: 'Điều khoản sử dụng', icon: Shield, color: '#64748B', target: 'LegalInfo', params: { type: 'terms' } },
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
            style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 14, paddingHorizontal: 20,
                borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
            }}
        >
            <View style={{
                width: 38, height: 38, borderRadius: 12,
                backgroundColor: item.color + '18',
                alignItems: 'center', justifyContent: 'center',
                marginRight: 14,
            }}>
                <item.icon size={18} color={item.color} strokeWidth={2} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' }}>{item.label}</Text>
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
            <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ marginBottom: 16 }}>
                    <Smile size={64} color="#2563EB" />
                </View>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
                    Chào bạn mới
                </Text>
                <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
                    Đăng nhập để xem thông tin cá nhân, cập nhật cài đặt và theo dõi chứng chỉ của bạn.
                </Text>
                <Button
                    variant="primary"
                    style={{ width: '100%', maxWidth: 300, paddingVertical: 14 }}
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
        <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{
                backgroundColor: '#ffffff',
                paddingTop: 52,
                paddingHorizontal: 20,
                paddingBottom: 28,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
            }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E293B', alignSelf: 'flex-start', marginBottom: 20 }}>
                    Cá nhân
                </Text>
                <Avatar name={user?.name || 'Học viên'} size={80} />
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 14 }}>
                    {user?.name || 'Học viên E-Learning'}
                </Text>
                <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                    {user?.email || 'Chưa cập nhật email'}
                </Text>

                {/* Stats row */}
                <View style={{
                    flexDirection: 'row', marginTop: 20, gap: 0,
                    backgroundColor: '#F8FAFC', borderRadius: 16,
                    borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden',
                }}>
                    {[
                        { label: 'Khóa học', value: '3' },
                        { label: 'Hoàn thành', value: '1' },
                        { label: 'Chứng chỉ', value: '1' },
                    ].map((stat, i) => (
                        <View
                            key={stat.label}
                            style={{
                                flex: 1, alignItems: 'center', paddingVertical: 14,
                                borderRightWidth: i < 2 ? 1 : 0,
                                borderRightColor: '#E2E8F0',
                            }}
                        >
                            <Text style={{ fontSize: 20, fontWeight: '800', color: '#2563EB' }}>{stat.value}</Text>
                            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: '500' }}>{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Menu Groups */}
            {MENU_GROUPS.map(group => (
                <View key={group.title} style={{ marginTop: 16, backgroundColor: '#ffffff' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#94A3B8', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        {group.title}
                    </Text>
                    {group.items.map(item => <MenuItem key={item.label} item={item} />)}
                </View>
            ))}

            {/* Logout */}
            <TouchableOpacity
                onPress={handleLogout}
                activeOpacity={0.75}
                style={{
                    marginHorizontal: 20, marginTop: 20, marginBottom: 40,
                    paddingVertical: 15, borderRadius: 14,
                    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
            >
                <LogOut size={18} color="#EF4444" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#EF4444' }}>Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default ProfileScreen;
