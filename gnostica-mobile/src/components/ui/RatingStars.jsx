import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';

const RatingStars = ({ rating = 0, reviewCount, size = 14, showCount = true }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <View className="flex-row items-center">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} size={size} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            ))}
            {hasHalfStar && (
                <View className="relative">
                    <Star size={size} color="#E2E8F0" fill="#E2E8F0" strokeWidth={0} />
                    <View className="absolute left-0 overflow-hidden" style={{ width: size / 2 }}>
                        <Star size={size} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
                    </View>
                </View>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} size={size} color="#E2E8F0" fill="#E2E8F0" strokeWidth={0} />
            ))}
            {showCount && (
                <Text className="text-slate-500 font-medium ml-1" style={{ fontSize: size - 1 }}>
                    {rating.toFixed(1)}{reviewCount ? ` (${reviewCount.toLocaleString()})` : ''}
                </Text>
            )}
        </View>
    );
};

export default RatingStars;
