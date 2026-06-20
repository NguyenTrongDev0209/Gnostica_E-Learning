import React, { useState } from 'react';
import {
    Text,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Menu, Bell, User, MessageSquare, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import SearchBar from '../../components/ui/SearchBar';
import HeroSection from '../../components/home/HeroSection';
import CategorySection from '../../components/home/CategorySection';
import CourseSection from '../../components/home/CourseSection';
import SideMenu from '../../components/ui/SideMenu';

const HomeScreen = () => {
    const navigation = useNavigation();
    const { cartItems } = useCart();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    return (
        <View className="flex-1 bg-slate-50">
            <SideMenu visible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
            
            <ScrollView 
                className="flex-1" 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                {/* Header */}
                <View className="flex-row items-center px-4 pt-10 pb-4 bg-white gap-3">
                    <TouchableOpacity className="p-1" onPress={() => setIsMenuVisible(true)}>
                        <Menu size={26} color="#1e293b" />
                    </TouchableOpacity>

                    <View className="flex-1">
                        <SearchBar
                            placeholder="Tìm kiếm"
                            style={{ backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 0 }}
                        />
                    </View>

                    <TouchableOpacity className="p-1">
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
                <CourseSection title="Khóa học thịnh hành" variant="trending" />

                {/* Discovery Section */}
                <View className="px-5 mt-6 gap-4">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-white p-4 rounded-[20px] border border-slate-100"
                            style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } }}
                            onPress={() => navigation.navigate('Forum')}
                        >
                            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mb-3">
                                <MessageSquare size={22} color="#2563EB" />
                            </View>
                            <Text className="text-[15px] font-extrabold text-slate-800">Diễn đàn</Text>
                            <Text className="text-[11px] text-slate-500 mt-0.5">Cùng thảo luận</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-white p-4 rounded-[20px] border border-slate-100"
                            style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } }}
                            onPress={() => navigation.navigate('InstructorList')}
                        >
                            <View className="w-10 h-10 rounded-xl bg-green-50 items-center justify-center mb-3">
                                <Users size={22} color="#10B981" />
                            </View>
                            <Text className="text-[15px] font-extrabold text-slate-800">Giảng viên</Text>
                            <Text className="text-[11px] text-slate-500 mt-0.5">Tìm chuyên gia</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <CourseSection title="Khóa học nổi bật" variant="featured" />

                <View className="h-5" />
            </ScrollView>
        </View>
    );
};

export default HomeScreen;
