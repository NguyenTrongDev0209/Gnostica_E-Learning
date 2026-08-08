import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../components/ui/AppText';
import AppHeader from '../../components/ui/AppHeader';
import { Check, ChevronDown, Package } from 'lucide-react-native';
import refundService from '../../services/checkout/refundService';
import orderService from '../../services/checkout/orderService';

const PREDEFINED_REASONS = [
    "Tôi mua nhầm khóa học",
    "Nội dung khóa học không như mong đợi",
    "Khóa học quá khó so với trình độ",
    "Video/Âm thanh chất lượng kém",
    "Khác"
];

const RefundRequestScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [eligibleItems, setEligibleItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedReasonChip, setSelectedReasonChip] = useState("");
    const [customReason, setCustomReason] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await orderService.getAll();
                const orders = response.data || response;
                let items = [];
                
                (Array.isArray(orders) ? orders : (orders.content || [])).forEach(order => {
                    // Only paid orders
                    if (order.status === 1 || order.status === 'SUCCESS' || order.status === 'PAID') {
                        const details = order.details || order.orderDetails || order.items || [];
                        details.forEach(detail => {
                            // Valid order detail, not gifted
                            if (detail.status === 1 && !detail.giftedTo) {
                                items.push({
                                    orderDetailId: detail.id,
                                    courseName: detail.courseName || detail.course?.title || detail.title || 'Khóa học',
                                    orderCode: order.orderCode || order.id,
                                    price: detail.price || 0,
                                    orderDate: order.createdAt || order.orderDate
                                });
                            }
                        });
                    }
                });
                
                setEligibleItems(items);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách khóa học có thể hoàn tiền.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleSubmit = async () => {
        if (!selectedItem) {
            Alert.alert("Lỗi", "Vui lòng chọn khóa học cần hoàn tiền.");
            return;
        }

        let finalReason = selectedReasonChip;
        if (selectedReasonChip === "Khác") {
            finalReason = customReason.trim();
        }

        if (!finalReason) {
            Alert.alert("Lỗi", "Vui lòng cung cấp lý do hoàn tiền.");
            return;
        }

        setSubmitting(true);
        try {
            await refundService.requestRefund({
                orderDetailId: selectedItem.orderDetailId,
                reason: finalReason
            });
            Alert.alert("Thành công", "Yêu cầu hoàn tiền đã được gửi.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Lỗi", error.toString());
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <AppHeader title="Yêu cầu hoàn tiền" />
            
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="items-center justify-center mt-10">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : (
                    <View className="space-y-6">
                        {/* Course Selection */}
                        <View>
                            <AppText className="text-sm font-bold text-slate-700 mb-2">Chọn khóa học</AppText>
                            {eligibleItems.length === 0 ? (
                                <View className="bg-white p-4 rounded-xl border border-slate-200 items-center">
                                    <Package size={32} color="#94A3B8" />
                                    <AppText className="text-slate-500 mt-2 text-center text-sm">
                                        Không tìm thấy khóa học nào đủ điều kiện hoàn tiền.
                                    </AppText>
                                </View>
                            ) : (
                                <View className="space-y-3">
                                    {eligibleItems.map((item, index) => {
                                        const isSelected = selectedItem?.orderDetailId === item.orderDetailId;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                activeOpacity={0.7}
                                                onPress={() => setSelectedItem(item)}
                                                className={`bg-white p-4 rounded-xl border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                                            >
                                                <View className="flex-row justify-between items-start">
                                                    <View className="flex-1 pr-2">
                                                        <AppText className="font-bold text-slate-800">{item.courseName}</AppText>
                                                        <AppText className="text-xs text-slate-500 mt-1">Đơn: #{item.orderCode}</AppText>
                                                    </View>
                                                    <View className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                                        {isSelected && <Check size={12} color="white" />}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                            <AppText className="text-xs text-slate-400 mt-2 italic px-1">
                                Lưu ý: Chỉ hiển thị các khóa học đã thanh toán. Tiến độ khóa học sẽ được kiểm tra khi gửi yêu cầu.
                            </AppText>
                        </View>

                        {/* Reason Selection */}
                        <View className="mt-4">
                            <AppText className="text-sm font-bold text-slate-700 mb-2">Lý do hoàn tiền <AppText className="text-red-500">*</AppText></AppText>
                            
                            <AppText className="text-[13px] text-slate-600 leading-5">
                                Hệ thống sẽ <AppText className="font-bold">tự động hoàn tiền</AppText> nếu yêu cầu của bạn được gửi trong vòng <AppText className="font-bold text-blue-600">14 ngày</AppText> kể từ lúc mua VÀ tiến độ học <AppText className="font-bold text-blue-600">dưới 20%</AppText>.
                            </AppText>
                            <AppText className="text-[13px] text-slate-600 leading-5 mt-1.5 mb-2">
                                Các trường hợp vượt quá giới hạn trên (tối đa 30 ngày) sẽ được gửi cho Quản trị viên để <AppText className="font-bold">xem xét thủ công</AppText>.
                            </AppText>

                            <View className="flex-row flex-wrap gap-2">
                                {PREDEFINED_REASONS.map((reason, idx) => {
                                    const isSelected = selectedReasonChip === reason;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => setSelectedReasonChip(reason)}
                                            className={`px-3 py-2 rounded-full border ${isSelected ? 'bg-blue-100 border-blue-500' : 'bg-white border-slate-200'} mb-2 mr-2`}
                                        >
                                            <AppText className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                {reason}
                                            </AppText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {selectedReasonChip === "Khác" && (
                                <TextInput
                                    className="bg-white border border-slate-200 rounded-xl p-3 mt-2 text-slate-800 min-h-[80px]"
                                    placeholder="Vui lòng nhập lý do cụ thể..."
                                    multiline
                                    textAlignVertical="top"
                                    value={customReason}
                                    onChangeText={setCustomReason}
                                />
                            )}
                        </View>

                        {/* Policy Info */}
                        <View className="bg-amber-50 p-3 rounded-xl border border-amber-100 mt-4 mb-20">
                            <AppText className="text-xs text-amber-800 leading-5">
                                • Tự động hoàn tiền: Trong 14 ngày & tiến độ học &lt; 20%.{'\n'}
                                • Chờ duyệt: Trong 30 ngày (kể cả &gt; 20% nhưng chưa hoàn thành).{'\n'}
                                • Tiền hoàn sẽ được cộng vào Ví Gnostica.
                            </AppText>
                        </View>

                    </View>
                )}
            </ScrollView>

            <View className="p-4 bg-white border-t border-slate-100 pb-8">
                <TouchableOpacity
                    disabled={submitting || !selectedItem || !selectedReasonChip || (selectedReasonChip === "Khác" && !customReason.trim())}
                    onPress={handleSubmit}
                    className={`h-12 rounded-xl items-center justify-center ${submitting || !selectedItem || !selectedReasonChip || (selectedReasonChip === "Khác" && !customReason.trim()) ? 'bg-slate-300' : 'bg-blue-600'}`}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <AppText className="text-white font-bold text-base">Gửi Yêu Cầu</AppText>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RefundRequestScreen;
