import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RatingStars from '../ui/RatingStars';

const BADGE_COLORS = {
    'Bán chạy': { bg: '#FEF3C7', text: '#92400E' },
    'Mới': { bg: '#DCFCE7', text: '#166534' },
    'Nổi bật': { bg: '#EDE9FE', text: '#5B21B6' },
};

const CourseCard = ({ course }) => {
    const navigation = useNavigation();
    const badge = course?.badge ? BADGE_COLORS[course.badge] : null;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('CourseDetail', { course })}
            style={{
                width: 220,
                backgroundColor: '#ffffff',
                borderRadius: 16,
                marginHorizontal: 8,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                marginBottom: 4,
            }}
            activeOpacity={0.85}
        >
            {/* Thumbnail */}
            <View style={{ position: 'relative' }}>
                <Image
                    source={{ uri: course?.thumbnail }}
                    style={{ width: '100%', height: 120, backgroundColor: '#E2E8F0' }}
                    resizeMode="cover"
                />
                {badge && (
                    <View style={{
                        position: 'absolute', top: 8, left: 8,
                        backgroundColor: badge.bg, borderRadius: 6,
                        paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: badge.text }}>
                            {course.badge}
                        </Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={{ padding: 12 }}>
                <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', lineHeight: 18, minHeight: 36 }}
                >
                    {course?.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4 }} numberOfLines={1}>
                    {course?.instructor}
                </Text>
                <View style={{ marginTop: 6 }}>
                    <RatingStars rating={course?.rating || 0} reviewCount={course?.reviewCount} size={12} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#2563EB' }}>
                        {course?.price}
                    </Text>
                    {course?.originalPrice && (
                        <Text style={{ fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' }}>
                            {course.originalPrice}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseCard;
