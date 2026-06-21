import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity,  } from 'react-native';
import { Menu, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import SearchBar from '../../components/ui/SearchBar';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import CourseSection from '../../components/home/CourseSection';
import InstructorSection from '../../components/home/InstructorSection';
import FAQSection from '../../components/home/FAQSection';
import SideMenu from '../../components/ui/SideMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { cartItems } = useCart();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-slate-50">
            <SideMenu visible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
            
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                {/* Header */}
                <View 
                    className="flex-row items-center px-4 pb-4 bg-white gap-3"
                    style={{ paddingTop: Math.max(insets.top, 20) + 12 }}
                >
                    <TouchableOpacity className="p-1" onPress={() => setIsMenuVisible(true)}>
                        <Menu size={26} color="#1e293b" />
                    </TouchableOpacity>

                    <View className="flex-1">
                        <SearchBar
                            placeholder="Tìm kiếm"
                            style={{ backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 0 }}
                        />
                    </View>

                    <TouchableOpacity className="p-1" onPress={() => navigation.navigate('Notifications')}>
                        <Bell size={24} color="#1e293b" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-[38px] h-[38px] rounded-[19px] bg-blue-50 border border-blue-200 items-center justify-center"
                        onPress={() => navigation.navigate('Login')}
                    >
                        <User size={22} color="#2563EB" />
                    </TouchableOpacity>
                </View>

                {/* Hero Banner */}
                <HeroSection />

                {/* Categories */}
                <CategorySection />

                {/* Course Sections */}
                <CourseSection title="Dành cho bạn" variant="foryou" />

                <CourseSection title="Khóa học thịnh hành" variant="trending" />

                <InstructorSection />

                <CourseSection title="Khóa học nổi bật" variant="featured" />

                {/* FAQ Section */}
                <FAQSection />

                {/* CTA Banner */}
                <View className="mx-5 mt-6 mb-6 bg-slate-900 rounded-2xl p-5 flex-row items-center">
                    <View className="flex-1 pr-4">
                        <AppText className="text-white font-bold text-base mb-1">Bạn là giảng viên?</AppText>
                        <AppText className="text-slate-400 text-xs leading-4">
                            Chia sẻ kiến thức và tạo thu nhập cùng Gnostica.
                        </AppText>
                    </View>
                    <TouchableOpacity
                        className="bg-white px-4 py-2.5 rounded-xl"
                        onPress={() => navigation.navigate('InstructorDashboard')}
                    >
                        <AppText className="text-slate-900 font-bold text-xs">Tìm hiểu</AppText>
                    </TouchableOpacity>
                </View>

                <View className="h-5" />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
