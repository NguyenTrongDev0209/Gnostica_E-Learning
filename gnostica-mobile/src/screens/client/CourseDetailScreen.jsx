import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Users, Clock, ChevronDown, ChevronUp, BookOpen, ShoppingBag } from 'lucide-react-native';
import RatingStars from '../../components/ui/RatingStars';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

const BADGE_COLORS = {
    'Bán chạy': { bg: '#FEF3C7', text: '#92400E' },
    'Mới':      { bg: '#DCFCE7', text: '#166534' },
    'Nổi bật':  { bg: '#EDE9FE', text: '#5B21B6' },
};

const CourseDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { cartItems, addToCart } = useCart();

    const course = route.params?.course;
    const [expandedSection, setExpandedSection] = useState(null);
    const badge = course?.badge ? BADGE_COLORS[course.badge] : null;

    if (!course) return null;

    const isInCart = cartItems.some(item => item.id === course.id);

    const handleCtaPress = () => {
        if (!isInCart) addToCart(course);
        navigation.navigate('Checkout');
    };

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Image */}
                <View className="relative">
                    <Image
                        source={{ uri: course.thumbnail }}
                        style={{ width, height: 220, backgroundColor: '#E2E8F0' }}
                        resizeMode="cover"
                    />
                    <View className="absolute top-0 bottom-0 left-0 right-0" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} />

                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute top-12 left-5 w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                    >
                        <ArrowLeft size={20} color="#ffffff" />
                    </TouchableOpacity>

                    {badge && (
                        <View
                            className="absolute top-12 right-5 rounded-lg px-3 py-[5px]"
                            style={{ backgroundColor: badge.bg }}
                        >
                            <Text className="text-xs font-bold" style={{ color: badge.text }}>
                                {course.badge}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Main Content */}
                <View className="bg-white p-5 mb-2">
                    <Text className="text-sm text-blue-600 font-semibold mb-2">{course.category}</Text>
                    <Text className="text-[20px] font-extrabold text-slate-800 leading-7 mb-3">
                        {course.title}
                    </Text>

                    {/* Rating & Stats */}
                    <RatingStars rating={course.rating} reviewCount={course.reviewCount} size={14} />
                    <View className="flex-row gap-5 mt-3">
                        <View className="flex-row items-center gap-[5px]">
                            <Users size={14} color="#64748B" />
                            <Text className="text-[13px] text-slate-500">
                                {course.studentCount?.toLocaleString()} học viên
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-[5px]">
                            <Clock size={14} color="#64748B" />
                            <Text className="text-[13px] text-slate-500">{course.duration}</Text>
                        </View>
                        <View className="flex-row items-center gap-[5px]">
                            <BookOpen size={14} color="#64748B" />
                            <Text className="text-[13px] text-slate-500">{course.level}</Text>
                        </View>
                    </View>

                    {/* Instructor */}
                    <View className="mt-4 pt-4 border-t border-slate-100 flex-row items-center gap-3">
                        <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center">
                            <Text className="text-lg">👨‍🏫</Text>
                        </View>
                        <View>
                            <Text className="text-xs text-slate-400 font-medium">Giảng viên</Text>
                            <Text className="text-sm text-slate-800 font-bold">{course.instructor}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View className="bg-white p-5 mb-2">
                    <Text className="text-base font-extrabold text-slate-800 mb-2.5">Mô tả khóa học</Text>
                    <Text className="text-sm text-slate-600 leading-[22px]">{course.description}</Text>
                </View>

                {/* Curriculum */}
                <View className="bg-white p-5 mb-2">
                    <Text className="text-base font-extrabold text-slate-800 mb-3">Nội dung khóa học</Text>
                    {course.curriculum?.map((section, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setExpandedSection(expandedSection === i ? null : i)}
                            className="flex-row justify-between items-center py-3 border-b border-slate-100"
                        >
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-slate-800">{section.section}</Text>
                                {expandedSection === i && (
                                    <Text className="text-[13px] text-slate-500 mt-1">
                                        {section.lessons} bài học
                                    </Text>
                                )}
                            </View>
                            {expandedSection === i
                                ? <ChevronUp size={18} color="#64748B" />
                                : <ChevronDown size={18} color="#64748B" />
                            }
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Sticky Bottom CTA */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3.5 pb-7 border-t border-slate-100 flex-row items-center gap-4"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8 }}
            >
                <View className="flex-1">
                    <Text className="text-lg font-extrabold text-blue-600">{course.price}</Text>
                    {course.originalPrice && (
                        <Text className="text-xs text-slate-400 line-through">{course.originalPrice}</Text>
                    )}
                </View>
                <Button
                    variant={isInCart ? 'outline' : 'primary'}
                    className="flex-[1.5] py-3.5 rounded-xl"
                    textClassName="text-[15px] font-bold"
                    icon={isInCart ? ShoppingBag : null}
                    onPress={handleCtaPress}
                >
                    {isInCart ? ' Đi đến giỏ hàng' : 'Thêm vào giỏ hàng'}
                </Button>
            </View>
        </View>
    );
};

export default CourseDetailScreen;
