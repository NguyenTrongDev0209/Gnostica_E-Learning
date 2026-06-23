import AppText from './AppText';
import React from 'react';
import { View, Image } from 'react-native';

const Avatar = ({ uri, name = '', size = 48, style }) => {
    const initials = name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex] || '#3B82F6';

    if (uri) {
        return (
            <Image
                source={{ uri }}
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
