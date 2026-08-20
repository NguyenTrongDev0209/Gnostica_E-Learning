import AppText from './AppText';
import React, { useState } from 'react';
import { View, Image } from 'react-native';

const Avatar = ({ uri, name = '', size = 48, style }) => {
    const [imgError, setImgError] = useState(false);

    const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const colorIndex = (name.charCodeAt(0) || 0) % colors.length;
    const bgColor = colors[colorIndex] || '#3B82F6';

    // Nếu có uri nhưng ảnh load lỗi (URL hỏng/mất mạng) → fallback về chữ cái đầu
    if (uri && !imgError) {
        return (
            <Image
                source={{ uri }}
                onError={() => setImgError(true)}
                style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
            />
        );
    }

    return (
        <View
            className="items-center justify-center"
            style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }, style]}
        >
            <AppText className="text-white font-bold" style={{ fontSize: size * 0.36 }}>
                {initials || '?'}
            </AppText>
        </View>
    );
};

export default Avatar;
