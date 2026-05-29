import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Download, Award, Share2 } from 'lucide-react-native';

const MOCK_CERTIFICATES = [
    {
        id: '1',
        courseTitle: 'Fullstack Web Development with Gnostica',
        date: '20/05/2026',
        code: 'GN-123456',
        image: 'https://img.freepik.com/premium-vector/professional-certificate-completion-template_1017-31644.jpg'
    }
];

const CertificatesScreen = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-800 ml-2">Chứng chỉ của tôi</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {MOCK_CERTIFICATES.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Award size={64} color="#CBD5E1" />
                        <Text className="text-lg font-bold text-slate-800 mt-4">Chưa có chứng chỉ</Text>
                        <Text className="text-slate-500 text-center mt-2">Hoàn thành các khóa học để nhận chứng chỉ từ Gnostica nhé!</Text>
                    </View>
                ) : (
                    MOCK_CERTIFICATES.map(item => (
                        <View key={item.id} className="bg-white rounded-3xl overflow-hidden mb-6 shadow-sm border border-slate-100">
                            <Image
                                source={{ uri: item.image }}
                                className="w-full h-48"
                                resizeMode="cover"
                            />
                            <View className="p-5">
                                <Text className="text-slate-900 font-bold text-lg mb-1">{item.courseTitle}</Text>
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-slate-500 text-xs">Ngày cấp: {item.date}</Text>
                                    <Text className="text-slate-500 text-xs">Mã: {item.code}</Text>
                                </View>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-blue-600 py-3 rounded-xl gap-2">
                                        <Download size={18} color="#fff" />
                                        <Text className="text-white font-bold">Tải xuống</Text>
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
