import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Star, Users, Clock, ChevronDown, ChevronUp, BookOpen, ShoppingBag } from 'lucide-react-native';
import RatingStars from '../../components/ui/RatingStars';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');
const BADGE_COLORS = {
    'Bán chạy': { bg: '#FEF3C7', text: '#92400E' },
    'Mới': { bg: '#DCFCE7', text: '#166534' },
    'Nổi bật': { bg: '#EDE9FE', text: '#5B21B6' },
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
        if (isInCart) {
            navigation.navigate('Cart');
        } else {
            addToCart(course);
            alert('Đã thêm vào giỏ hàng!');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Image */}
                <View style={{ position: 'relative' }}>
                    <Image
                        source={{ uri: course.thumbnail }}
                        style={{ width, height: 220, backgroundColor: '#E2E8F0' }}
                        resizeMode="cover"
                    />
                    <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />

                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute', top: 48, left: 20,
                            width: 40, height: 40, borderRadius: 20,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={20} color="#ffffff" />
                    </TouchableOpacity>

                    {badge && (
                        <View style={{
                            position: 'absolute', top: 48, right: 20,
                            backgroundColor: badge.bg, borderRadius: 8,
                            paddingHorizontal: 12, paddingVertical: 5,
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: badge.text }}>{course.badge}</Text>
                        </View>
                    )}
                </View>

                {/* Main Content */}
                <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: '#2563EB', fontWeight: '600', marginBottom: 8 }}>
                        {course.category}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#1E293B', lineHeight: 28, marginBottom: 12 }}>
                        {course.title}
                    </Text>

                    {/* Rating & Stats row */}
                    <RatingStars rating={course.rating} reviewCount={course.reviewCount} size={14} />
                    <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Users size={14} color="#64748B" />
                            <Text style={{ fontSize: 13, color: '#64748B' }}>
                                {course.studentCount?.toLocaleString()} học viên
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Clock size={14} color="#64748B" />
                            <Text style={{ fontSize: 13, color: '#64748B' }}>{course.duration}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <BookOpen size={14} color="#64748B" />
                            <Text style={{ fontSize: 13, color: '#64748B' }}>{course.level}</Text>
                        </View>
                    </View>

                    {/* Instructor */}
                    <View style={{
                        marginTop: 16, paddingTop: 16,
                        borderTopWidth: 1, borderTopColor: '#F1F5F9',
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}>
                        <View style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Text style={{ fontSize: 18 }}>👨‍🏫</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>Giảng viên</Text>
                            <Text style={{ fontSize: 14, color: '#1E293B', fontWeight: '700' }}>{course.instructor}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 10 }}>Mô tả khóa học</Text>
                    <Text style={{ fontSize: 14, color: '#475569', lineHeight: 22 }}>{course.description}</Text>
                </View>

                {/* Curriculum */}
                <View style={{ backgroundColor: '#ffffff', padding: 20, marginBottom: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 }}>Nội dung khóa học</Text>
                    {course.curriculum?.map((section, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setExpandedSection(expandedSection === i ? null : i)}
                            style={{
                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                                paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>{section.section}</Text>
                                {expandedSection === i && (
                                    <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
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
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: '#ffffff',
                paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 28,
                borderTopWidth: 1, borderTopColor: '#F1F5F9',
                flexDirection: 'row', alignItems: 'center', gap: 16,
                shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
            }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#2563EB' }}>{course.price}</Text>
                    {course.originalPrice && (
                        <Text style={{ fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' }}>
                            {course.originalPrice}
                        </Text>
                    )}
                </View>
                <Button
                    variant={isInCart ? "outline" : "primary"}
                    style={{ flex: 1.5, paddingVertical: 14, borderRadius: 12 }}
                    textStyle={{ fontSize: 15, fontWeight: '700' }}
                    icon={isInCart ? ShoppingBag : null}
                    onPress={handleCtaPress}
                >
                    {isInCart ? " Đi đến giỏ hàng" : "Thêm vào giỏ hàng"}
                </Button>
            </View>
        </View>
    );
};

export default CourseDetailScreen;
