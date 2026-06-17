import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RatingStars from '../ui/RatingStars';

const BADGE_COLORS = {
    'Bán chạy': { bg: '#FEF3C7', text: '#92400E' },
    'Mới':      { bg: '#DCFCE7', text: '#166534' },
    'Nổi bật':  { bg: '#EDE9FE', text: '#5B21B6' },
};

const CourseCard = ({ course, width }) => {
    const navigation = useNavigation();
    const badge = course?.badge ? BADGE_COLORS[course.badge] : null;

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('CourseDetail', { course })}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-1"
            style={{ width: width || '100%' }}
            activeOpacity={0.85}
        >
            {/* Thumbnail */}
            <View className="relative">
                <Image
                    source={{ uri: course?.thumbnail }}
                    className="w-full bg-slate-200"
                    style={{ height: 120 }}
                    resizeMode="cover"
                />
                {badge && (
                    <View
                        className="absolute top-2 left-2 rounded-md px-2 py-[3px]"
                        style={{ backgroundColor: badge.bg }}
                    >
                        <Text className="text-[10px] font-bold" style={{ color: badge.text }}>
                            {course.badge}
                        </Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View className="p-3">
                <Text
                    numberOfLines={2}
                    className="text-[13px] font-bold text-slate-800 leading-[18px] min-h-[36px]"
                >
                    {course?.title}
                </Text>
                <Text className="text-xs text-slate-500 mt-1" numberOfLines={1}>
                    {course?.instructor}
                </Text>
                <View className="mt-1.5">
                    <RatingStars rating={course?.rating || 0} reviewCount={course?.reviewCount} size={12} />
                </View>
                <View className="flex-row items-center mt-2 gap-1.5">
                    <Text className="text-sm font-extrabold text-blue-600">
                        {course?.price}
                    </Text>
                    {course?.originalPrice && (
                        <Text className="text-[11px] text-slate-400 line-through">
                            {course.originalPrice}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CourseCard;
