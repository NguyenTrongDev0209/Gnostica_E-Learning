import React from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Bell, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import CourseSection from '../../components/home/CourseSection';

const HomeScreen = () => {
    const navigation = useNavigation();

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* Header / Logo Section */}
            <View className="flex-row justify-between items-center px-5 pt-10 pb-3 bg-header-bg shadow-sm z-10">
                <Image
                    source={require('../../assets/images/Gnostica_Mark.webp')}
                    className="w-36 h-10"
                    resizeMode="contain"
                />
                <View className="flex-row items-center space-x-3 gap-3">
                    <TouchableOpacity className="w-11 h-11 rounded-full bg-slate-50 border border-slate-100 items-center justify-center active:opacity-70">
                        <Bell size={24} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 items-center justify-center active:opacity-70"
                        onPress={() => navigation.navigate('Login')}
                    >
                        <User size={24} color="#2563eb" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hero Section */}
            <HeroSection />

            {/* Categories Grid */}
            <CategorySection />

            {/* Trending Courses */}
            <CourseSection title="Khóa học thịnh hành" />

            {/* Featured Courses */}
            <CourseSection title="Khóa học nổi bật" />

            <View className="h-10" />
        </ScrollView>
    );
};

export default HomeScreen;
