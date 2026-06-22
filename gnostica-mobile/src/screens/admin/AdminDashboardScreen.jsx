import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Users, ShoppingBag, BookOpen, AlertCircle, TrendingUp, ChevronRight, Settings } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';


const AdminDashboardScreen = () => {
    const navigation = useNavigation();

    const stats = [
        { label: 'Doanh thu tháng', value: '150.2Mđ', icon: TrendingUp, color: '#10b981' },
        { label: 'Người dùng mới', value: '450', icon: Users, color: '#3b82f6' },
        { label: 'Đơn hàng mới', value: '28', icon: ShoppingBag, color: '#f59e0b' },
        { label: 'Cần duyệt', value: '12', icon: AlertCircle, color: '#ef4444' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Quản trị viên" />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    {stats.map((stat, i) => (
                        <View key={i} className="w-[48%] bg-white p-4 rounded-3xl mb-4 shadow-sm border border-slate-100">
                            <View
                                className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                style={{ backgroundColor: stat.color + '15' }}
                            >
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <AppText className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</AppText>
                            <AppText className="text-slate-900 font-bold text-lg mt-1">{stat.value}</AppText>
                        </View>
                    ))}
                </View>

                {/* System Management */}
                <AppText className="text-slate-800 font-bold text-base mb-4">Quản lý hệ thống</AppText>

                {[
                    { label: 'Quản lý khóa học', icon: BookOpen, target: 'AdminCourses', desc: 'Danh sách toàn bộ khóa học' },
                    { label: 'Duyệt khóa học', icon: AlertCircle, target: 'AdminCourseModeration', desc: 'Khóa học chờ duyệt' },
                    { label: 'Danh mục', icon: BookOpen, target: 'AdminCategories', desc: 'Quản lý thể loại' },
                    { label: 'Quản lý người dùng', icon: Users, target: 'UserManagement', desc: 'Học viên & Giảng viên' },
                    { label: 'Giao dịch', icon: ShoppingBag, target: 'AdminTransactions', desc: 'Lịch sử thanh toán' },
                    { label: 'Duyệt đơn hàng', icon: ShoppingBag, target: 'OrderModeration', desc: 'Đơn hàng mua thủ công' },
                    { label: 'Tài khoản ngân hàng', icon: Settings, target: 'AdminBanks', desc: 'Cấu hình thanh toán' },
                    { label: 'Mã giảm giá', icon: ShoppingBag, target: 'AdminCoupons', desc: 'Mã giảm giá hệ thống' },
                    { label: 'Báo cáo vi phạm', icon: AlertCircle, target: 'AdminReports', desc: 'Xử lý báo cáo' },
                    { label: 'Quản lý đánh giá', icon: AlertCircle, target: 'AdminReviews', desc: 'Review khóa học' },
                    { label: 'Danh mục diễn đàn', icon: Users, target: 'AdminForumCategory', desc: 'Chủ đề forum' },
                    { label: 'Duyệt bài diễn đàn', icon: AlertCircle, target: 'AdminThreadModeration', desc: 'Bài viết chờ duyệt' },
                    { label: 'Cài đặt hệ thống', icon: Settings, target: 'AdminSettings', desc: 'Cấu hình nền tảng' },
                ].map((item, i) => (
                    <TouchableOpacity
                        key={i}
                        className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-slate-100 flex-row items-center"
                        onPress={() => navigation.navigate(item.target)}
                    >
                        <View className="w-12 h-12 bg-slate-50 rounded-xl items-center justify-center">
                            <item.icon size={22} color="#475569" />
                        </View>
                        <View className="ml-4 flex-1">
                            <AppText className="text-slate-900 font-bold text-sm">{item.label}</AppText>
                            <AppText className="text-slate-400 text-xs mt-0.5">{item.desc}</AppText>
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                ))}

                {/* Real-time Logs Placeholder */}
                <View className="bg-white p-5 rounded-3xl mt-4 mb-10 shadow-sm border border-slate-100">
                    <View className="flex-row justify-between items-center mb-4">
                        <AppText className="text-slate-800 font-bold text-base">Hoạt động gần đây</AppText>
                        <TouchableOpacity><AppText className="text-blue-600 text-xs font-bold">Xem tất cả</AppText></TouchableOpacity>
                    </View>

                    {[
                        { text: 'Người dùng kha_tran vừa mua khóa học React', time: '2 phút trước' },
                        { text: 'Giảng viên Hoang_Long cập nhật bài giảng mới', time: '15 phút trước' },
                        { text: 'Hệ thống vừa backup dữ liệu thành công', time: '1 giờ trước' },
                    ].map((log, i) => (
                        <View key={i} className="flex-row items-start mb-4 gap-3">
                            <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                            <View className="flex-1">
                                <AppText className="text-slate-700 text-xs leading-5">{log.text}</AppText>
                                <AppText className="text-slate-400 text-[10px] mt-0.5">{log.time}</AppText>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default AdminDashboardScreen;
