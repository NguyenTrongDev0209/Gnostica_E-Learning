import React, { useState } from 'react';
import { View, ScrollView, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppText from '../../components/ui/AppText';
import AppHeader from '../../components/ui/AppHeader';
import Button from '../../components/ui/Button';
import giftService from '../../services/checkout/giftService';
import { User, MessageSquare } from 'lucide-react-native';

const GiftScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { course } = route.params || {};
    
    const [email, setEmail] = useState('');
    const [receiver, setReceiver] = useState(null);
    const [message, setMessage] = useState('');
    
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    if (!course) {
        return (
            <View className="flex-1 bg-slate-50">
                <AppHeader title="Tặng khóa học" />
                <View className="flex-1 items-center justify-center p-5">
                    <AppText className="text-lg font-bold text-slate-800 mb-2">Không có khóa học</AppText>
                    <Button variant="primary" onPress={() => navigation.goBack()}>Quay lại</Button>
                </View>
            </View>
        );
    }

    const formatPrice = (priceStr) => {
        return priceStr;
    };

    const handleSearch = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email người nhận.');
            return;
        }

        setIsSearching(true);
        try {
            const response = await giftService.searchReceiver(email.trim(), course.id);
            const data = response.data || response;
            
            if (data.senderOwns) {
                Alert.alert('Lỗi', data.errorMessage || 'Bạn đã sở hữu khóa học này nên không thể tặng.');
                return;
            }

            if (data.valid || data.alreadyOwned) {
                setReceiver(data);
            } else {
                Alert.alert('Lỗi', data.errorMessage || 'Không thể tặng cho tài khoản này.');
            }
        } catch (error) {
            Alert.alert('Lỗi', error?.message || 'Có lỗi xảy ra khi tìm kiếm người nhận.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreateGift = async () => {
        if (!receiver) return;
        if (receiver.alreadyOwned) {
            Alert.alert('Lỗi', 'Người này đã sở hữu khóa học.');
            return;
        }

        setIsCreating(true);
        try {
            const payload = {
                courseId: course.id,
                receiverEmail: receiver.email,
                message: message.trim(),
                paymentMethod: 'PAYOS',
                returnUrl: 'gnostica://payment-result',
                cancelUrl: 'gnostica://payment-cancel'
            };

            const response = await giftService.createGift(payload);
            const data = response.data || response;

            if (data && data.qrCode) {
                navigation.navigate('PaymentQRCode', { paymentData: data });
            } else if (data && data.error === 0 && data.data) {
                navigation.navigate('PaymentQRCode', { paymentData: data.data });
            } else {
                Alert.alert('Lỗi', data.message || 'Không thể tạo đơn tặng quà.');
            }
        } catch (error) {
            Alert.alert('Lỗi mạng', error?.message || 'Không thể kết nối đến server.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View className="flex-1 bg-slate-50">
                <AppHeader title="Tặng khóa học" />
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    
                    {/* Course Summary */}
                    <View className="p-4">
                        <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Khóa học sẽ tặng
                        </AppText>
                        <View className="flex-row bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                            <Image
                                source={{ uri: course.thumbnail }}
                                className="w-[72px] h-[72px] rounded-xl bg-slate-200"
                            />
                            <View className="flex-1 ml-3 justify-center">
                                <AppText className="text-[13px] font-bold text-slate-800 mb-1" numberOfLines={2}>
                                    {course.title}
                                </AppText>
                                <AppText className="text-sm font-extrabold text-blue-600">{formatPrice(course.price)}</AppText>
                            </View>
                        </View>
                    </View>

                    {/* Step 1: Search Receiver */}
                    <View className="px-4 mb-4">
                        <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            Thông tin người nhận
                        </AppText>
                        <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <View className="flex-row items-center gap-2">
                                <View className="flex-1 flex-row items-center bg-slate-50 rounded-xl px-3 h-[46px] border border-slate-200">
                                    <User size={18} color="#64748b" />
                                    <TextInput
                                        placeholder="Nhập email người nhận..."
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 ml-2 text-sm text-slate-800 p-0 m-0"
                                        value={email}
                                        onChangeText={(text) => {
                                            setEmail(text);
                                            setReceiver(null); // reset receiver if email changes
                                        }}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                                <Button
                                    variant={receiver ? 'secondary' : 'primary'}
                                    className="px-4 h-[46px] py-0 rounded-xl"
                                    textClassName="text-sm"
                                    onPress={handleSearch}
                                    disabled={!email || isSearching}
                                >
                                    {isSearching ? 'Đang tìm...' : 'Kiểm tra'}
                                </Button>
                            </View>

                            {receiver && (
                                <View className="mt-4 pt-4 border-t border-slate-100">
                                    {receiver.alreadyOwned && (
                                        <View className="bg-red-50 p-3 rounded-xl mb-3">
                                            <AppText className="text-red-600 text-xs font-semibold">
                                                Người dùng này đã sở hữu khóa học nên bạn không thể tặng.
                                            </AppText>
                                        </View>
                                    )}
                                    {receiver.previouslyRejected && !receiver.alreadyOwned && (
                                        <View className="bg-orange-50 p-3 rounded-xl mb-3">
                                            <AppText className="text-orange-600 text-xs font-semibold">
                                                Cảnh báo: Người này đã từng từ chối nhận món quà này trước đó.
                                            </AppText>
                                        </View>
                                    )}
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
                                            {receiver.avatar ? (
                                                <Image source={{ uri: receiver.avatar }} className="w-full h-full" />
                                            ) : (
                                                <AppText className="font-bold text-slate-500">{receiver.fullName?.charAt(0)}</AppText>
                                            )}
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <AppText className="font-bold text-slate-800 text-sm">{receiver.fullName}</AppText>
                                            <AppText className="text-slate-500 text-xs">{receiver.email}</AppText>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Step 2: Message & Confirm (Only if receiver is valid) */}
                    {receiver && !receiver.alreadyOwned && (
                        <View className="px-4 mb-6">
                            <AppText className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                Lời nhắn (Không bắt buộc)
                            </AppText>
                            <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                <View className="flex-row items-start bg-slate-50 rounded-xl px-3 py-3 border border-slate-200">
                                    <MessageSquare size={18} color="#64748b" style={{ marginTop: 2 }} />
                                    <TextInput
                                        placeholder="Nhập lời nhắn gửi đến người nhận..."
                                        placeholderTextColor="#94a3b8"
                                        className="flex-1 ml-2 text-sm text-slate-800 p-0 m-0"
                                        value={message}
                                        onChangeText={setMessage}
                                        multiline
                                        numberOfLines={3}
                                        style={{ height: 60, textAlignVertical: 'top' }}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                    
                    <View className="h-20" />
                </ScrollView>

                {/* Footer Pay Button */}
                {receiver && !receiver.alreadyOwned && (
                    <View className="bg-white px-5 py-4 pb-8 border-t border-slate-100">
                        <Button
                            variant="primary"
                            className="py-4 rounded-xl"
                            textClassName="text-base font-bold"
                            onPress={handleCreateGift}
                            disabled={isCreating}
                        >
                            {isCreating ? 'Đang tạo thanh toán...' : `Tặng ${formatPrice(course.price)}`}
                        </Button>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default GiftScreen;
