import AppText from '../../components/ui/AppText';
import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Share } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Download, Award, Share2, Calendar, User, CheckCircle2 } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import certificateService from '../../services/profile/certificateService';

const CertificatesScreen = () => {
    const navigation = useNavigation();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;
            setLoading(true);

            certificateService.getAll()
                .then(response => {
                    if (!isMounted) return;
                    const data = response.data || response.content || response;
                    if (Array.isArray(data)) {
                        setCertificates(data);
                    }
                })
                .catch(error => {
                    console.error('Error fetching certificates:', error);
                })
                .finally(() => {
                    if (isMounted) setLoading(false);
                });

            return () => {
                isMounted = false;
            };
        }, [])
    );

    const handleShare = async (cert) => {
        try {
            await Share.share({
                message: `Chứng chỉ hoàn thành khóa học "${cert.courseTitle}" tại Gnostica!\nMã chứng chỉ: ${cert.certificateUrl || cert.certifiUrl || cert.code || 'GNOSTICA-CERT'}`,
                title: 'Chứng chỉ Gnostica',
            });
        } catch (e) {
            console.error('Share certificate error:', e);
        }
    };

    const handleDownload = (cert) => {
        Alert.alert('Thành công', `Đã lưu thông tin chứng chỉ "${cert.courseTitle}" vào thiết bị của bạn.`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Mới cấp';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
        } catch (_) {
            return dateStr;
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Chứng chỉ của tôi" />

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : certificates.length === 0 ? (
                    <View className="items-center justify-center py-16 px-4 bg-white rounded-2xl border border-slate-100 mt-4">
                        <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-4">
                            <Award size={36} color="#2563eb" />
                        </View>
                        <AppText className="text-lg font-bold text-slate-800">Chưa có chứng chỉ nào</AppText>
                        <AppText className="text-slate-500 text-center mt-2 text-sm leading-5">
                            Hãy hoàn thành các khóa học 100% để nhận chứng chỉ chính thức từ Gnostica nhé!
                        </AppText>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MyCourses')}
                            className="mt-6 bg-blue-600 px-6 py-3 rounded-xl"
                        >
                            <AppText className="text-white font-bold text-sm">Học tiếp ngay</AppText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    certificates.map((item, index) => {
                        const uniqueKey = item.certificateUrl || item.certifiUrl || item.code || item.id || `cert-${index}`;
                        const courseTitle = item.courseTitle || item.title || 'Khóa học Gnostica';
                        const studentName = item.studentName || 'Học viên';
                        const instructorName = item.instructorName || 'Giảng viên Gnostica';
                        const certCode = item.certificateUrl || item.certifiUrl || item.code || 'GNO-CERT';

                        return (
                            <View 
                                key={uniqueKey} 
                                className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm border border-slate-100"
                            >
                                {/* Certificate Card Graphic */}
                                <View className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 relative overflow-hidden bg-slate-900">
                                    <View className="flex-row justify-between items-center mb-3">
                                        <View className="flex-row items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                                            <CheckCircle2 size={13} color="#10B981" />
                                            <AppText className="text-xs font-bold text-emerald-400">Chứng nhận chính thức</AppText>
                                        </View>
                                        <Award size={24} color="#F59E0B" />
                                    </View>
                                    
                                    <AppText className="text-white text-lg font-black leading-6 mb-2" numberOfLines={2}>
                                        {courseTitle}
                                    </AppText>
                                    
                                    <View className="flex-row items-center gap-2 mt-2">
                                        <User size={13} color="#94A3B8" />
                                        <AppText className="text-slate-300 text-xs font-medium">Học viên: {studentName}</AppText>
                                    </View>

                                    <View className="flex-row items-center gap-2 mt-1">
                                        <Calendar size={13} color="#94A3B8" />
                                        <AppText className="text-slate-400 text-xs">Cấp ngày: {formatDate(item.completedAt || item.issuedAt || item.date)}</AppText>
                                    </View>
                                </View>

                                {/* Certificate Body Actions */}
                                <View className="p-4 bg-white">
                                    <View className="flex-row justify-between items-center mb-3">
                                        <AppText className="text-slate-400 text-[11px] font-mono">Mã: {certCode}</AppText>
                                        <AppText className="text-slate-500 text-xs font-medium">GV: {instructorName}</AppText>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <TouchableOpacity 
                                            onPress={() => handleDownload(item)}
                                            activeOpacity={0.8}
                                            className="flex-1 flex-row items-center justify-center bg-blue-600 py-3 rounded-xl gap-2 shadow-sm"
                                        >
                                            <Download size={18} color="#fff" />
                                            <AppText className="text-white font-bold text-sm">Tải xuống</AppText>
                                        </TouchableOpacity>

                                        <TouchableOpacity 
                                            onPress={() => handleShare(item)}
                                            activeOpacity={0.8}
                                            className="w-12 items-center justify-center bg-slate-100 rounded-xl"
                                        >
                                            <Share2 size={18} color="#475569" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-16" />
            </ScrollView>
        </View>
    );
};

export default CertificatesScreen;
