import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, } from 'react-native';
import { Menu, Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import SearchBar from '../../components/ui/SearchBar';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import CourseSection from '../../components/home/CourseSection';
import InstructorSection from '../../components/home/InstructorSection';
import FAQSection from '../../components/home/FAQSection';
import SideMenu from '../../components/ui/SideMenu';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';

import api from '../../services/api';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { isAuthenticated } = useAuth();
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const [trendingCourses, setTrendingCourses] = useState([]);

    useEffect(() => {
        const fetchTrendingCourses = async () => {
            try {
                const result = await api.get('/courses?size=10');
                if (result.content) {
                    const formatted = result.content.map(course => ({
                        id: course.id.toString(),
                        slug: course.slug,
                        title: course.title,
                        thumbnail: course.thumbnail,
                        instructor: course.instructorName || 'Giảng viên',
                        rating: 4.5,
                        category: course.categoryName,
                        studentCount: course.students || 0,
                        price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.salePrice),
                        originalPrice: course.discount > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : null
                    }));
                    setTrendingCourses(formatted);
                }
            } catch (error) {
                console.error('Error fetching trending courses:', error);
            }
        };
        fetchTrendingCourses();
    }, []);

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
                        onPress={() => navigation.navigate(isAuthenticated ? 'Profile' : 'Register')}
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

                <CourseSection title="Khóa học thịnh hành" variant="trending" customData={trendingCourses.length > 0 ? trendingCourses : undefined} />

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
