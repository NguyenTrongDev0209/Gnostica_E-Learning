import AppText from '../../components/ui/AppText';
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Users, Clock, ChevronDown, ChevronUp, BookOpen, ShoppingBag, Star, PlayCircle, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingStars from '../../components/ui/RatingStars';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

const BADGE_COLORS = {
    'Bán chạy': { bg: '#FEF3C7', text: '#92400E' },
    'Mới':      { bg: '#DCFCE7', text: '#166534' },
    'Nổi bật':  { bg: '#EDE9FE', text: '#5B21B6' },
};

const TABS = [
    { key: 'desc',       label: 'Mô tả' },
    { key: 'curriculum', label: 'Nội dung' },
    { key: 'reviews',    label: 'Đánh giá' },
];

// Mock reviews
const MOCK_REVIEWS = [
    { id: 1, name: 'Minh Tuấn', avatar: '👨‍💻', rating: 5, date: '12/06/2025', comment: 'Khóa học rất chất lượng, giảng viên dạy dễ hiểu và thực tế. Mình đã áp dụng ngay vào dự án công ty!' },
    { id: 2, name: 'Thu Hương', avatar: '👩‍🎓', rating: 4, date: '03/06/2025', comment: 'Nội dung phong phú, ví dụ minh họa cụ thể. Chỉ ước phần cuối có thêm bài tập thực hành.' },
    { id: 3, name: 'Đức Anh', avatar: '🧑‍💼', rating: 5, date: '28/05/2025', comment: 'Đây là một trong những khóa học tốt nhất mình từng học. Highly recommend!' },
];

const StarRow = ({ rating }) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={13} color="#fbbf24" fill={i <= rating ? '#fbbf24' : 'transparent'} />
        ))}
    </View>
);

const CourseDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const { cartItems, addToCart } = useCart();

    const course = route.params?.course;
    const [activeTab, setActiveTab] = useState('desc');
    const [expandedSection, setExpandedSection] = useState(null);
    const badge = course?.badge ? BADGE_COLORS[course.badge] : null;

    if (!course) return null;

    const isInCart = cartItems.some(item => item.id === course.id);

    const handleCtaPress = () => {
        if (!isInCart) addToCart(course);
        navigation.navigate('Checkout');
    };

    const IMAGE_HEIGHT = 220;

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* Status bar background */}
            <View style={{ height: Math.max(insets.top, 20), backgroundColor: '#fff' }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

                {/* Hero Image */}
                <View style={{ position: 'relative', height: IMAGE_HEIGHT }}>
                    <Image
                        source={{ uri: course.thumbnail }}
                        style={{ width, height: IMAGE_HEIGHT, backgroundColor: '#E2E8F0' }}
                        resizeMode="cover"
                    />
                    {/* Dark overlay */}
                    <View style={{
                        position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
                        backgroundColor: 'rgba(0,0,0,0.28)',
                    }} />

                    {/* Back button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute',
                            top: 10,
                            left: 20,
                            width: 38, height: 38,
                            borderRadius: 19,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>


                </View>

                {/* Course Info Card */}
                <View style={{ backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 20, marginBottom: 2 }}>
                    <AppText style={{ fontSize: 13, color: '#2563eb', fontFamily: 'Inter_600SemiBold', marginBottom: 6 }}>
                        {course.category}
                    </AppText>
                    <AppText style={{ fontSize: 21, fontFamily: 'Inter_700Bold', color: '#1e293b', lineHeight: 30, marginBottom: 12 }}>
                        {course.title}
                    </AppText>

                    {/* Rating */}
                    <RatingStars rating={course.rating} reviewCount={course.reviewCount} size={14} />

                    {/* Stats */}
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Users size={14} color="#64748b" />
                            <AppText style={{ fontSize: 13, color: '#64748b' }}>
                                {course.studentCount?.toLocaleString()} học viên
                            </AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Clock size={14} color="#64748b" />
                            <AppText style={{ fontSize: 13, color: '#64748b' }}>{course.duration}</AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <BookOpen size={14} color="#64748b" />
                            <AppText style={{ fontSize: 13, color: '#64748b' }}>{course.level}</AppText>
                        </View>
                    </View>

                    {/* Instructor */}
                    <View style={{
                        marginTop: 16, paddingTop: 16,
                        borderTopWidth: 1, borderTopColor: '#f1f5f9',
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}>
                        <View style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: '#eff6ff',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <AppText style={{ fontSize: 20 }}>👨‍🏫</AppText>
                        </View>
                        <View>
                            <AppText style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Inter_500Medium' }}>Giảng viên</AppText>
                            <AppText style={{ fontSize: 14, color: '#1e293b', fontFamily: 'Inter_700Bold' }}>{course.instructor}</AppText>
                        </View>
                    </View>
                </View>

                {/* ──────────── TAB BAR ──────────── */}
                <View style={{
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f1f5f9',
                    marginBottom: 2,
                }}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                paddingVertical: 14,
                                borderBottomWidth: 2.5,
                                borderBottomColor: activeTab === tab.key ? '#2563eb' : 'transparent',
                            }}
                        >
                            <AppText style={{
                                fontSize: 14,
                                fontFamily: activeTab === tab.key ? 'Inter_700Bold' : 'Inter_500Medium',
                                color: activeTab === tab.key ? '#2563eb' : '#94a3b8',
                            }}>
                                {tab.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ──────────── TAB CONTENT ──────────── */}

                {/* Tab: Mô tả */}
                {activeTab === 'desc' && (
                    <View style={{ backgroundColor: '#fff', padding: 20 }}>
                        <AppText style={{
                            fontSize: 14, color: '#475569',
                            fontFamily: 'Inter_400Regular',
                            lineHeight: 24,
                        }}>
                            {course.description}
                        </AppText>

                        {/* What you'll learn */}
                        <AppText style={{
                            fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1e293b',
                            marginTop: 24, marginBottom: 14,
                        }}>
                            Bạn sẽ học được gì?
                        </AppText>
                        {[
                            'Nắm vững kiến thức nền tảng đến nâng cao',
                            'Xây dựng dự án thực tế có thể đưa vào portfolio',
                            'Được hỗ trợ bởi cộng đồng học viên năng động',
                            'Nhận chứng chỉ hoàn thành được công nhận',
                        ].map((item, i) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                <View style={{
                                    width: 22, height: 22, borderRadius: 11,
                                    backgroundColor: '#eff6ff',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginTop: 1,
                                }}>
                                    <AppText style={{ fontSize: 11, color: '#2563eb', fontFamily: 'Inter_700Bold' }}>✓</AppText>
                                </View>
                                <AppText style={{ flex: 1, fontSize: 13, color: '#475569', fontFamily: 'Inter_400Regular', lineHeight: 20 }}>
                                    {item}
                                </AppText>
                            </View>
                        ))}
                    </View>
                )}

                {/* Tab: Nội dung */}
                {activeTab === 'curriculum' && (
                    <View style={{ backgroundColor: '#fff', padding: 20 }}>
                        <AppText style={{
                            fontSize: 13, color: '#64748b',
                            fontFamily: 'Inter_400Regular', marginBottom: 16,
                        }}>
                            {course.curriculum?.length} chương • {course.curriculum?.reduce((s, c) => s + c.lessons, 0)} bài học
                        </AppText>
                        {course.curriculum?.map((section, i) => (
                            <View key={i} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                <TouchableOpacity
                                    onPress={() => setExpandedSection(expandedSection === i ? null : i)}
                                    style={{
                                        flexDirection: 'row', justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingVertical: 14,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <AppText style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#1e293b' }}>
                                            Chương {i + 1}: {section.section}
                                        </AppText>
                                        {expandedSection !== i && (
                                            <AppText style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                                {section.lessons} bài học
                                            </AppText>
                                        )}
                                    </View>
                                    {expandedSection === i
                                        ? <ChevronUp size={18} color="#94a3b8" />
                                        : <ChevronDown size={18} color="#94a3b8" />
                                    }
                                </TouchableOpacity>

                                {expandedSection === i && (
                                    <View style={{ paddingBottom: 16 }}>
                                        {Array.from({ length: Math.min(section.lessons, 6) }).map((_, idx) => {
                                            const isVideo = idx % 3 !== 2;
                                            const isFree = i === 0 && idx === 0; // First lesson is free preview
                                            return (
                                                <TouchableOpacity key={idx} style={{ 
                                                    flexDirection: 'row', alignItems: 'center', 
                                                    paddingVertical: 12, paddingLeft: 10,
                                                }}>
                                                    {isVideo ? (
                                                        <PlayCircle size={18} color={isFree ? '#2563eb' : '#94a3b8'} />
                                                    ) : (
                                                        <FileText size={18} color="#94a3b8" />
                                                    )}
                                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                                        <AppText style={{ 
                                                            fontSize: 13, 
                                                            color: isFree ? '#1e293b' : '#475569', 
                                                            fontFamily: isFree ? 'Inter_600SemiBold' : 'Inter_500Medium' 
                                                        }}>
                                                            {idx + 1}. {isVideo ? 'Video bài giảng' : 'Tài liệu đọc'}
                                                        </AppText>
                                                    </View>
                                                    <AppText style={{ 
                                                        fontSize: 12, 
                                                        color: isFree ? '#2563eb' : '#94a3b8',
                                                        fontFamily: isFree ? 'Inter_600SemiBold' : 'Inter_400Regular'
                                                    }}>
                                                        {isFree ? 'Học thử' : (isVideo ? `0${idx + 2}:${idx * 15 + 10}` : '2 trang')}
                                                    </AppText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                        {section.lessons > 6 && (
                                            <TouchableOpacity style={{ paddingVertical: 8, alignItems: 'center' }}>
                                                <AppText style={{ fontSize: 12, color: '#2563eb', fontFamily: 'Inter_600SemiBold' }}>
                                                    Xem thêm {section.lessons - 6} bài học
                                                </AppText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Tab: Đánh giá */}
                {activeTab === 'reviews' && (
                    <View style={{ backgroundColor: '#fff', padding: 20 }}>
                        {/* Summary */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 20,
                            backgroundColor: '#f8fafc', borderRadius: 16, padding: 16,
                            marginBottom: 20,
                        }}>
                            <View style={{ alignItems: 'center' }}>
                                <AppText style={{ fontSize: 44, fontFamily: 'Inter_700Bold', color: '#1e293b', lineHeight: 52 }}>
                                    {course.rating}
                                </AppText>
                                <StarRow rating={Math.round(course.rating)} />
                                <AppText style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                    {course.reviewCount?.toLocaleString()} đánh giá
                                </AppText>
                            </View>
                            <View style={{ flex: 1, gap: 5 }}>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <AppText style={{ fontSize: 11, color: '#64748b', width: 8 }}>{star}</AppText>
                                        <View style={{ flex: 1, height: 6, backgroundColor: '#e2e8f0', borderRadius: 3 }}>
                                            <View style={{
                                                height: 6, borderRadius: 3,
                                                backgroundColor: '#fbbf24',
                                                width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 6 : 3}%`,
                                            }} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Reviews list */}
                        {MOCK_REVIEWS.map(review => (
                            <View key={review.id} style={{
                                paddingVertical: 16,
                                borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <View style={{
                                        width: 38, height: 38, borderRadius: 19,
                                        backgroundColor: '#f1f5f9',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <AppText style={{ fontSize: 18 }}>{review.avatar}</AppText>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <AppText style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#1e293b' }}>
                                            {review.name}
                                        </AppText>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                            <StarRow rating={review.rating} />
                                            <AppText style={{ fontSize: 11, color: '#94a3b8' }}>{review.date}</AppText>
                                        </View>
                                    </View>
                                </View>
                                <AppText style={{ fontSize: 13, color: '#475569', fontFamily: 'Inter_400Regular', lineHeight: 20 }}>
                                    {review.comment}
                                </AppText>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Sticky Bottom CTA */}
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: '#fff',
                paddingHorizontal: 20, paddingTop: 16,
                paddingBottom: Math.max(insets.bottom, 16),
                borderTopWidth: 1, borderTopColor: '#f1f5f9',
                flexDirection: 'row', alignItems: 'center', gap: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 8,
            }}>
                <View style={{ flex: 1 }}>
                    <AppText style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#2563eb' }}>
                        {course.price}
                    </AppText>
                    {course.originalPrice && (
                        <AppText style={{ fontSize: 12, color: '#94a3b8', textDecorationLine: 'line-through' }}>
                            {course.originalPrice}
                        </AppText>
                    )}
                </View>
                <Button
                    variant="primary"
                    className="flex-[1.5] py-3.5 rounded-xl"
                    textClassName="text-[15px] font-bold"
                    onPress={() => navigation.navigate('Checkout', { course })}
                >
                    Mua ngay
                </Button>
            </View>
        </View>
    );
};

export default CourseDetailScreen;
