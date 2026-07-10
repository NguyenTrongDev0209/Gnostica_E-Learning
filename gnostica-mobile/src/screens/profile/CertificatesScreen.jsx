import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Download, Award, Share2 } from 'lucide-react-native';
import AppHeader from '../../components/ui/AppHeader';
import certificateService from '../../services/profile/certificateService';

const CertificatesScreen = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await certificateService.getAll();
                const data = response.data || response.content || response;
                if (Array.isArray(data)) {
                    setCertificates(data);
                }
            } catch (error) {
                console.error('Error fetching certificates:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <AppHeader title="Chứng chỉ của tôi" />

            <ScrollView className="flex-1 p-4">
                {loading ? (
                    <View className="flex-1 justify-center items-center mt-20">
                        <ActivityIndicator size="large" color="#2563EB" />
                    </View>
                ) : certificates.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Award size={64} color="#CBD5E1" />
                        <AppText className="text-lg font-bold text-slate-800 mt-4">Chưa có chứng chỉ</AppText>
                        <AppText className="text-slate-500 text-center mt-2">Hoàn thành các khóa học để nhận chứng chỉ từ Gnostica nhé!</AppText>
                    </View>
                ) : (
                    certificates.map(item => (
                        <View key={item.id || item.code} className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100">
                            <Image
                                source={{ uri: item.image || 'https://img.freepik.com/premium-vector/professional-certificate-completion-template_1017-31644.jpg' }}
                                className="w-full h-48"
                                resizeMode="cover"
                            />
                            <View className="p-5">
                                <AppText className="text-slate-900 font-bold text-lg mb-1">{item.courseTitle || item.title}</AppText>
                                <View className="flex-row justify-between items-center mb-4">
                                    <AppText className="text-slate-500 text-xs">Ngày cấp: {item.date || item.issuedAt}</AppText>
                                    <AppText className="text-slate-500 text-xs">Mã: {item.code || item.certifiUrl}</AppText>
                                </View>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-blue-600 py-3 rounded-xl gap-2">
                                        <Download size={18} color="#fff" />
                                        <AppText className="text-white font-bold">Tải xuống</AppText>
                                    </TouchableOpacity>
                                    <TouchableOpacity className="w-12 items-center justify-center bg-slate-100 rounded-xl">
                                        <Share2 size={18} color="#475569" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default CertificatesScreen;
