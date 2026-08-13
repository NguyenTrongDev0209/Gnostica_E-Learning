import AppText from '../../components/ui/AppText';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Users, Clock, ChevronDown, ChevronUp, BookOpen, ShoppingBag, Star, PlayCircle, FileText, Bookmark, X, Gift } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingStars from '../../components/ui/RatingStars';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import RenderHtml from 'react-native-render-html';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import courseService from '../../services/course/courseService';
import wishlistService from '../../services/course/wishlistService';
import VideoPlayer from '../../components/course/VideoPlayer';

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
    const { user } = useAuth();

    const courseParams = route.params?.course || (
        (route.params?.slug || route.params?.id) ? {
            slug: route.params?.slug || route.params?.id,
            id: route.params?.id || route.params?.slug,
            title: route.params?.title || 'Khóa học'
        } : null
    );
    const [courseDetail, setCourseDetail] = useState(null);
    const [activeTab, setActiveTab] = useState('desc');
    const [expandedSection, setExpandedSection] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [isPromoVideoOpen, setIsPromoVideoOpen] = useState(false);
    // Server-signed embed URL (Bunny embed token auth), fetched when the
    // trailer opens so the token is always fresh.
    const [promoEmbedUrl, setPromoEmbedUrl] = useState(null);

    const promoSlug = courseParams?.slug || courseDetail?.slug || targetSlugOrId;

    useEffect(() => {
        if (!isPromoVideoOpen || !promoSlug) return;
        let cancelled = false;
        setPromoEmbedUrl(null);
        courseService.getPromoPlayback(promoSlug)
            .then((res) => {
                const data = res?.data ?? res;
                if (!cancelled) setPromoEmbedUrl(data?.embedUrl || null);
            })
            .catch(() => {
                if (!cancelled) setPromoEmbedUrl(null);
            });
        return () => { cancelled = true; };
    }, [isPromoVideoOpen, promoSlug]);
    
    const formatPrice = (value) => {
        if (!value) return '0 đ';
        return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
    };

    // Lấy thông tin cơ bản từ màn Home, ghi đè bằng chi tiết từ API (nếu có)
    const course = courseDetail ? { 
        ...courseParams, 
        ...courseDetail,
        price: courseDetail.salePrice ? formatPrice(courseDetail.salePrice) : formatPrice(courseDetail.price),
        originalPrice: courseDetail.discount > 0 ? formatPrice(courseDetail.price) : null
    } : courseParams;
    const badge = course?.badge ? BADGE_COLORS[course.badge] : null;

    const targetSlugOrId = courseParams?.slug || route.params?.slug || route.params?.id;

    useEffect(() => {
        if (targetSlugOrId) {
            const fetchDetail = async () => {
                try {
                    const data = await courseService.getBySlug(targetSlugOrId);
                    setCourseDetail(data.data || data);
                } catch (e) {
                    console.error('Error fetching course detail:', e);
                }
            };
            fetchDetail();
        }
    }, [targetSlugOrId]);

    const targetCourseId = courseParams?.id || courseDetail?.id || course?.id;

    useEffect(() => {
        if (!user || !targetCourseId) return;
        wishlistService.check(targetCourseId)
            .then(res => {
                const data = res?.data ?? res;
                setIsSaved(
                    data === true ||
                    data?.isFavourite === true ||
                    data?.wishlisted === true ||
                    data?.saved === true
                );
            })
            .catch(() => {});
    }, [user, targetCourseId]);

    const handleToggleSave = async () => {
        if (!user) {
            navigation.navigate('Login');
            return;
        }
        if (!targetCourseId) return;
        setLoadingSave(true);
        try {
            const res = await wishlistService.toggle(targetCourseId);
            const data = res?.data ?? res;
            if (data?.isFavourite !== undefined) {
                setIsSaved(data.isFavourite);
            } else {
                setIsSaved(prev => !prev);
            }
        } catch (e) {
            console.error('Toggle wishlist error:', e);
        } finally {
            setLoadingSave(false);
        }
    };

    if (!course) {
        return (
            <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
                <AppText style={{ marginTop: 12, color: '#64748b', fontSize: 13 }}>Đang tải thông tin khóa học...</AppText>
            </View>
        );
    }

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

                    {course.promoVideo && (
                        <TouchableOpacity
                            onPress={() => setIsPromoVideoOpen(true)}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityLabel="Phát trailer khóa học"
                            style={{
                                position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <View style={{
                                width: 58, height: 58, borderRadius: 29, backgroundColor: '#f97316',
                                alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
                                shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
                            }}>
                                <PlayCircle size={30} color="#fff" fill="#f97316" />
                            </View>
                        </TouchableOpacity>
                    )}

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

                    {/* Save / Bookmark button */}
                    <TouchableOpacity
                        onPress={handleToggleSave}
                        activeOpacity={0.85}
                        style={{
                            position: 'absolute',
                            top: 10,
                            right: 20,
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: 'transparent',
                            elevation: 6,
                            shadowColor: '#ea580c',
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.4,
                            shadowRadius: 6,
                        }}
                    >
                        {loadingSave ? (
                            <View style={{
                                width: 42, height: 42, borderRadius: 21,
                                backgroundColor: 'rgba(0,0,0,0.45)',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ActivityIndicator size="small" color="#fff" />
                            </View>
                        ) : (
                            <LinearGradient
                                colors={isSaved ? ['#fb923c', '#ea580c'] : ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.45)']}
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 21,
                                    borderWidth: isSaved ? 2.5 : 0,
                                    borderColor: '#fff',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Bookmark
                                    size={20}
                                    color="#fff"
                                    fill={isSaved ? '#fff' : 'transparent'}
                                    strokeWidth={2}
                                />
                            </LinearGradient>
                        )}
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
                            <AppText style={{ fontSize: 14, color: '#1e293b', fontFamily: 'Inter_700Bold' }}>
                                {typeof course.instructor === 'string' && course.instructor.trim()
                                    ? course.instructor
                                    : (course.instructor?.fullName || course.instructor?.name || course.instructorName || course.authorName || course.account?.fullName || 'Giảng viên Gnostica')}
                            </AppText>
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
                        <RenderHtml
                            contentWidth={width - 40}
                            source={{ html: course.description || '<p>Chưa có mô tả khóa học</p>' }}
                            baseStyle={{
                                fontSize: 14, color: '#475569',
                                fontFamily: 'Inter_400Regular',
                                lineHeight: 24,
                            }}
                            systemFonts={['Inter_400Regular', 'Inter_700Bold', 'Inter_500Medium', 'Inter_600SemiBold']}
                        />

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
                            {course.modules?.length || 0} chương • {course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)} bài học
                        </AppText>
                        {course.modules?.map((module, i) => (
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
                                            Chương {i + 1}: {module.title}
                                        </AppText>
                                        {expandedSection !== i && (
                                            <AppText style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                                {module.lessons?.length || 0} bài học
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
                                        {module.lessons?.map((lesson, idx) => {
                                            const isVideo = !!lesson.videoUrl;
                                            const isFree = i === 0 && idx === 0; // Bài học đầu tiên học thử
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
                                                            {idx + 1}. {lesson.title}
                                                        </AppText>
                                                    </View>
                                                    <AppText style={{ 
                                                        fontSize: 12, 
                                                        color: isFree ? '#2563eb' : '#94a3b8',
                                                        fontFamily: isFree ? 'Inter_600SemiBold' : 'Inter_400Regular'
                                                    }}>
                                                        {isFree ? 'Học thử' : (isVideo ? 'Video' : 'Tài liệu')}
                                                    </AppText>
                                                </TouchableOpacity>
                                            );
                                        })}
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
                        {(courseDetail?.reviews || []).map(review => (
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
                                        <AppText style={{ fontSize: 18 }}>{review.avatar || '👨‍🎓'}</AppText>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <AppText style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#1e293b' }}>
                                            {review.name || review.userName || 'Học viên'}
                                        </AppText>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                            <StarRow rating={review.rating} />
                                            <AppText style={{ fontSize: 11, color: '#94a3b8' }}>{review.date || 'Gần đây'}</AppText>
                                        </View>
                                    </View>
                                </View>
                                <AppText style={{ fontSize: 13, color: '#475569', fontFamily: 'Inter_400Regular', lineHeight: 20 }}>
                                    {review.comment || review.content}
                                </AppText>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={isPromoVideoOpen}
                animationType="fade"
                presentationStyle="fullScreen"
                onRequestClose={() => setIsPromoVideoOpen(false)}
            >
                {isPromoVideoOpen && (
                    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
                        <VideoPlayer
                            source={course.promoVideo}
                            embedUrl={promoEmbedUrl}
                            autoplay
                            style={{ width, height: width * 0.5625 }}
                        />
                        <TouchableOpacity
                            onPress={() => setIsPromoVideoOpen(false)}
                            accessibilityRole="button"
                            accessibilityLabel="Đóng trailer khóa học"
                            style={{
                                position: 'absolute', top: Math.max(insets.top, 20), right: 20,
                                width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(0,0,0,0.6)',
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </Modal>

            {/* Sticky Bottom CTA */}
            <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                backgroundColor: '#fff',
                paddingHorizontal: 20, paddingTop: 8,
                paddingBottom: (insets.bottom || 0) + 8,
                borderTopWidth: 1, borderTopColor: '#f1f5f9',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 8,
            }}>
                <View style={{ flex: 1, justifyContent: 'center', marginRight: 12 }}>
                    <MaskedView
                        maskElement={
                            <AppText 
                                numberOfLines={1} 
                                adjustsFontSizeToFit
                                style={{ fontSize: 24, fontFamily: 'Inter_700Bold', backgroundColor: 'transparent' }}
                            >
                                {course.price}
                            </AppText>
                        }
                    >
                        <LinearGradient
                            colors={['#fb923c', '#ea580c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <AppText 
                                numberOfLines={1} 
                                adjustsFontSizeToFit
                                style={{ fontSize: 24, fontFamily: 'Inter_700Bold', opacity: 0 }}
                            >
                                {course.price}
                            </AppText>
                        </LinearGradient>
                    </MaskedView>
                    {course.originalPrice && (
                        <AppText style={{ fontSize: 13, color: '#94a3b8', textDecorationLine: 'line-through', marginTop: -4 }}>
                            {course.originalPrice}
                        </AppText>
                    )}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Gift', { course })}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 12,
                            backgroundColor: '#eff6ff',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#bfdbfe'
                        }}
                    >
                        <Gift size={22} color="#2563eb" />
                    </TouchableOpacity>
                    <Button
                        variant="primary"
                        className="px-6 py-3.5 rounded-xl h-[50px] items-center justify-center"
                        textClassName="text-[16px] font-bold"
                        onPress={() => navigation.navigate('Checkout', { course })}
                    >
                        Mua ngay
                    </Button>
                </View>
            </View>
        </View>
    );
};

export default CourseDetailScreen;
