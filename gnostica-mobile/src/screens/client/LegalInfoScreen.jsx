import AppText from '../../components/ui/AppText';
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Shield, Info, FileText } from 'lucide-react-native';

const LegalInfoScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { type } = route.params || { type: 'about' };

    const getContent = () => {
        switch (type) {
            case 'privacy':
                return {
                    title: 'Chính sách bảo mật',
                    icon: Shield,
                    color: '#ec4899',
                    text: 'Tại Gnostica, chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo mật thông tin cá nhân của người dùng...\n\n1. Thu thập thông tin: Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, mua khóa học...\n\n2. Sử dụng thông tin: Thông tin của bạn được sử dụng để cá nhân hóa trải nghiệm học tập, xử lý giao dịch...\n\n3. Bảo mật: Chúng tôi áp dụng các biện pháp kỹ thuật tiên tiến để bảo vệ dữ liệu của bạn khỏi các truy cập trái phép.'
                };
            case 'terms':
                return {
                    title: 'Điều khoản sử dụng',
                    icon: FileText,
                    color: '#6366f1',
                    text: 'Bằng việc sử dụng Gnostica, bạn đồng ý tuân thủ các điều khoản sau đây:\n\n1. Quyền sở hữu trí tuệ: Tất cả nội dung trên nền tảng này thuộc sở hữu của Gnostica hoặc các đối tác...\n\n2. Tài khoản người dùng: Bạn có trách nhiệm bảo mật tài khoản của mình...\n\n3. Hoàn tiền: Chính sách hoàn tiền áp dụng trong vòng 7 ngày kể từ khi mua khóa học nếu bạn chưa xem quá 20% nội dung.'
                };
            default:
                return {
                    title: 'Về Gnostica',
                    icon: Info,
                    color: '#3b82f6',
                    text: 'Gnostica là nền tảng E-Learning hàng đầu, cung cấp các khóa học chất lượng cao từ các chuyên gia hàng đầu trong nhiều lĩnh vực công nghệ, thiết kế và kinh doanh.\n\nSứ mệnh của chúng tôi là mang tri thức đến mọi người một cách dễ dàng, hiệu quả và tối ưu nhất thông qua trải nghiệm học tập hiện đại trên cả web và di động.'
                };
        }
    };

    const content = getContent();

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-12 pb-4 px-4 border-b border-slate-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <AppText className="text-xl font-bold text-slate-800 ml-2">{content.title}</AppText>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                    <View
                        className="w-20 h-20 rounded-3xl items-center justify-center shadow-lg"
                        style={{ backgroundColor: content.color }}
                    >
                        <content.icon size={40} color="#fff" />
                    </View>
                </View>

                <AppText className="text-slate-700 text-base leading-7 text-justify">
                    {content.text}
                </AppText>

                <View className="mt-12 mb-20 items-center">
                    <AppText className="text-slate-400 text-xs">Cập nhật lần cuối: 25/05/2026</AppText>
                    <AppText className="text-slate-300 text-[10px] mt-1">© 2026 Gnostica Team. All rights reserved.</AppText>
                </View>
            </ScrollView>
        </View>
    );
};

export default LegalInfoScreen;
