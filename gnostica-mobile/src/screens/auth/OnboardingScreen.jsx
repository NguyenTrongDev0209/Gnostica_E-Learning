import React, { useRef, useState } from 'react';
import {
    View, Animated, Dimensions, TouchableOpacity,
    FlatList, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Zap, Award, Users } from 'lucide-react-native';
import AppText from '../../components/ui/AppText';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        icon: BookOpen,
        iconColor: '#3b82f6',
        iconBg: ['#dbeafe', '#bfdbfe'],
        title: 'Học mọi lúc,\nmọi nơi',
        subtitle: 'Hàng trăm khóa học chất lượng cao từ các giảng viên hàng đầu, luôn sẵn sàng trên mọi thiết bị.',
        gradientColors: ['#eff6ff', '#dbeafe'],
        accentColor: '#2563eb',
    },
    {
        id: '2',
        icon: Zap,
        iconColor: '#f97316',
        iconBg: ['#ffedd5', '#fed7aa'],
        title: 'Tiến bộ\nnhanh hơn',
        subtitle: 'Lộ trình học cá nhân hóa giúp bạn tiến bộ đúng hướng. Theo dõi tiến độ học tập theo thời gian thực.',
        gradientColors: ['#fff7ed', '#ffedd5'],
        accentColor: '#ea580c',
    },
    {
        id: '3',
        icon: Users,
        iconColor: '#8b5cf6',
        iconBg: ['#ede9fe', '#ddd6fe'],
        title: 'Cộng đồng\nhọc tập',
        subtitle: 'Kết nối với hàng nghìn học viên và giảng viên. Thảo luận, chia sẻ và cùng nhau phát triển.',
        gradientColors: ['#f5f3ff', '#ede9fe'],
        accentColor: '#7c3aed',
    },
    {
        id: '4',
        icon: Award,
        iconColor: '#10b981',
        iconBg: ['#d1fae5', '#a7f3d0'],
        title: 'Nhận chứng chỉ\ncó giá trị',
        subtitle: 'Hoàn thành khóa học và nhận chứng chỉ được công nhận bởi các doanh nghiệp hàng đầu.',
        gradientColors: ['#ecfdf5', '#d1fae5'],
        accentColor: '#059669',
    },
];

const OnboardingScreen = ({ onFinish }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            onFinish?.();
        }
    };

    const handleSkip = () => {
        onFinish?.();
    };

    const isLast = currentIndex === SLIDES.length - 1;

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Skip button */}
            {!isLast && (
                <TouchableOpacity
                    onPress={handleSkip}
                    style={{
                        position: 'absolute', top: 56, right: 24, zIndex: 10,
                        paddingHorizontal: 16, paddingVertical: 8,
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        borderRadius: 20,
                    }}
                >
                    <AppText style={{ color: '#64748b', fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                        Bỏ qua
                    </AppText>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={e => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(idx);
                }}
                renderItem={({ item }) => {
                    const Icon = item.icon;
                    return (
                        <View style={{ width, flex: 1 }}>
                            <LinearGradient
                                colors={item.gradientColors}
                                style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
                            >
                                {/* Icon illustration */}
                                <LinearGradient
                                    colors={item.iconBg}
                                    style={{
                                        width: 160,
                                        height: 160,
                                        borderRadius: 48,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 48,
                                        shadowColor: item.iconColor,
                                        shadowOffset: { width: 0, height: 12 },
                                        shadowOpacity: 0.25,
                                        shadowRadius: 24,
                                        elevation: 12,
                                    }}
                                >
                                    <Icon size={72} color={item.iconColor} strokeWidth={1.5} />
                                </LinearGradient>

                                {/* Text */}
                                <AppText style={{
                                    fontSize: 34,
                                    fontFamily: 'Inter_700Bold',
                                    color: '#1e293b',
                                    textAlign: 'center',
                                    lineHeight: 42,
                                    marginBottom: 16,
                                }}>
                                    {item.title}
                                </AppText>
                                <AppText style={{
                                    fontSize: 15,
                                    fontFamily: 'Inter_400Regular',
                                    color: '#64748b',
                                    textAlign: 'center',
                                    lineHeight: 24,
                                }}>
                                    {item.subtitle}
                                </AppText>
                            </LinearGradient>
                        </View>
                    );
                }}
            />

            {/* Bottom controls */}
            <View style={{
                backgroundColor: '#fff',
                paddingHorizontal: 28,
                paddingTop: 24,
                paddingBottom: 48,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 8,
            }}>
                {/* Dot indicators */}
                <View style={{ flexDirection: 'row', marginBottom: 28, gap: 6 }}>
                    {SLIDES.map((_, idx) => {
                        const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        const bgColor = SLIDES[currentIndex].accentColor;

                        return (
                            <Animated.View key={idx} style={{
                                width: dotWidth,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: bgColor,
                                opacity,
                            }} />
                        );
                    })}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    activeOpacity={0.85}
                    style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}
                >
                    <LinearGradient
                        colors={
                            isLast
                                ? ['#10b981', '#059669']
                                : [SLIDES[currentIndex].accentColor, SLIDES[currentIndex].accentColor + 'cc']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                            paddingVertical: 17,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AppText style={{
                            color: '#fff',
                            fontSize: 16,
                            fontFamily: 'Inter_700Bold',
                            letterSpacing: 0.3,
                        }}>
                            {isLast ? 'Bắt đầu học ngay' : 'Tiếp theo'}
                        </AppText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OnboardingScreen;
