import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AppHeader from '../../components/ui/AppHeader';
import AppText from '../../components/ui/AppText';
import Button from '../../components/ui/Button';
import giftService from '../../services/checkout/giftService';
import { useAuth } from '../../context/AuthContext';
import { Gift, Clock } from 'lucide-react-native';

const STATUS = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2,
    EXPIRED: 3
};

const GiftResponseScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { token } = route.params || {};
    const { user } = useAuth();
    
    const [gift, setGift] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGift = async () => {
            try {
                const response = await giftService.getGiftByToken(token);
                const data = response.data || response;
                setGift(data);
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Không tìm thấy thông tin quà tặng hoặc link đã hết hạn.');
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchGift();
        } else {
            setError('Mã quà tặng không hợp lệ.');
            setIsLoading(false);
        }
    }, [token]);

    const requireAuth = () => {
        if (!user) {
            Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để nhận quà.', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
            ]);
            return false;
        }
        return true;
    };

    const handleAccept = async () => {
        if (!requireAuth()) return;
        
        setActionLoading(true);
        try {
            const data = await giftService.acceptGift(token);
            if (data.alreadyOwned) {
                Alert.alert('Thông báo', data.message || 'Bạn đã sở hữu khóa học này. Quà tặng đã được tự động hoàn lại cho người gửi.');
                setGift({ ...gift, status: STATUS.REJECTED });
            } else {
                Alert.alert('Thành công', data.message || 'Đã nhận quà tặng thành công!');
                setGift({ ...gift, status: STATUS.ACCEPTED });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Lỗi khi nhận quà';
            if (errorMsg.includes('không dành cho bạn')) {
                Alert.alert('Lỗi', 'Quà tặng này được gửi cho một tài khoản email khác.');
            } else {
                Alert.alert('Lỗi', errorMsg);
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!requireAuth()) return;
        
        setActionLoading(true);
        try {
            await giftService.rejectGift(token);
            Alert.alert('Thành công', 'Đã từ chối quà tặng. Tiền sẽ được hoàn lại cho người gửi.');
            setGift({ ...gift, status: STATUS.REJECTED });
        } catch (err) {
            Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi khi từ chối quà');
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50">
                <AppHeader title="Chi tiết quà tặng" />
                <View className="flex-1 items-center justify-center">
                    <AppText className="text-slate-500">Đang tải...</AppText>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 bg-slate-50">
                <AppHeader title="Chi tiết quà tặng" />
                <View className="flex-1 items-center justify-center p-5">
                    <AppText className="text-red-500 font-bold mb-4 text-center">{error}</AppText>
                    <Button variant="primary" onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
                        Về trang chủ
                    </Button>
                </View>
            </View>
        );
    }

    if (!gift) return null;

    const isPending = gift.status === STATUS.PENDING;

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader title="Món quà cho bạn" />
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-4">
                    <View className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                        {/* Banner */}
                        <View className="bg-blue-50 py-8 px-4 items-center justify-center relative overflow-hidden">
                            <Gift className="w-20 h-20 text-blue-100 absolute -right-4 -bottom-4 transform rotate-12" />
                            <AppText className="text-xl font-bold text-blue-600 z-10 flex-row items-center">
                                Món quà từ {gift.senderName}
                            </AppText>
                        </View>

                        <View className="p-5">
                            {/* Status Alert */}
                            {!isPending && (
                                <View className="mb-5">
                                    {gift.status === STATUS.ACCEPTED && (
                                        <View className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <AppText className="text-green-700 font-bold">Đã nhận thành công</AppText>
                                            <AppText className="text-green-600 text-sm mt-1">Bạn có thể bắt đầu học khóa học này ngay bây giờ.</AppText>
                                        </View>
                                    )}
                                    {gift.status === STATUS.REJECTED && (
                                        <View className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                            <AppText className="text-orange-700 font-bold">Đã từ chối</AppText>
                                            <AppText className="text-orange-600 text-sm mt-1">Món quà đã bị từ chối và tiền đã được hoàn lại.</AppText>
                                        </View>
                                    )}
                                    {gift.status === STATUS.EXPIRED && (
                                        <View className="bg-red-50 p-3 rounded-xl border border-red-100">
                                            <AppText className="text-red-700 font-bold">Hết hạn</AppText>
                                            <AppText className="text-red-600 text-sm mt-1">Món quà đã hết hạn (sau 7 ngày).</AppText>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Course Info */}
                            <Image 
                                source={{ uri: gift.courseThumbnail }} 
                                className="w-full h-40 rounded-xl mb-4 bg-slate-200"
                                resizeMode="cover"
                            />
                            
                            <AppText className="font-bold text-lg text-slate-800 leading-tight mb-1">
                                {gift.courseTitle}
                            </AppText>
                            <AppText className="text-sm font-extrabold text-blue-600 mb-4">
                                {(gift.coursePrice || 0).toLocaleString('vi-VN')} đ
                            </AppText>
                            {gift.giftCode && (
                                <AppText className="text-xs text-slate-400 mb-3">
                                    Mã quà: <AppText className="font-bold text-slate-600">TG-{gift.giftCode}</AppText>
                                </AppText>
                            )}

                            {gift.message && (
                                <View className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500 mb-4">
                                    <AppText className="italic text-slate-700">"{gift.message}"</AppText>
                                </View>
                            )}

                            {isPending && (
                                <View className="flex-row items-center">
                                    <Clock size={14} color="#64748b" />
                                    <AppText className="text-xs text-slate-500 ml-1">
                                        Hết hạn vào: {new Date(gift.expiredAt).toLocaleDateString('vi-VN')}
                                    </AppText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <View className="h-20" />
            </ScrollView>

            {/* Action Buttons */}
            {isPending && (
                <View className="bg-white px-4 py-4 pb-8 flex-row border-t border-slate-100 gap-3">
                    <Button 
                        variant="secondary" 
                        className="flex-1 py-4 rounded-xl"
                        textClassName="font-bold text-slate-700"
                        onPress={handleReject}
                        disabled={actionLoading}
                    >
                        Từ chối
                    </Button>
                    <Button 
                        variant="primary" 
                        className="flex-1 py-4 rounded-xl"
                        textClassName="font-bold text-white"
                        onPress={handleAccept}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Đang xử lý...' : 'Nhận quà'}
                    </Button>
                </View>
            )}
        </View>
    );
};

export default GiftResponseScreen;
